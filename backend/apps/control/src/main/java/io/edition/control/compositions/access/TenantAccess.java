package io.edition.control.compositions.access;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.permission.api.PermissionApi.Operation;
import io.edition.concepts.permission.api.PermissionApi.Principal;
import io.edition.concepts.permission.api.PermissionApi.PrincipalType;
import io.edition.concepts.permission.api.PermissionApi.Resource;
import io.edition.concepts.permission.api.PermissionApi.ResourceType;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi.TenantId;
import io.edition.concepts.tenantregistry.api.TenantScopeApi;
import io.edition.control.compositions.principal.PrincipalResolution;
import io.edition.control.compositions.principal.PrincipalResolver.Credential;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * 租户作用域管理入口的统一前置——syncs/SYNCS.md「租户准入与真实资源链」的唯一实现。
 *
 * <p>{@link #admit}：解析主体 → 租户存在且未冻结 → Session 主体必须是该租户成员，
 * TOKEN 主体必须绑定该租户。{@link #require}：admit 之后再按资源链问 Permission。
 * 全部读写都在租户上下文内执行（RLS），调用方不再手写 {@code inTenant}。
 *
 * <p>各 flow 的 *Access 只保留与自身动作枚举有关的投影，租户准入规则不得再各抄一份。
 */
@Component
public final class TenantAccess {

    public static final Operation READ = new Operation("read");
    public static final Operation WRITE = new Operation("write");
    public static final Operation PUBLISH = new Operation("publish");
    public static final Operation ADMIN = new Operation("admin");

    private final PrincipalResolution principals;
    private final PermissionGuard guard;
    private final PermissionApi permissions;
    private final MembershipApi memberships;
    private final TenantRegistryApi tenants;
    private final TenantScopeApi tenantScope;

    public TenantAccess(
            PrincipalResolution principals,
            PermissionGuard guard,
            PermissionApi permissions,
            MembershipApi memberships,
            TenantRegistryApi tenants,
            TenantScopeApi tenantScope) {
        this.principals = principals;
        this.guard = guard;
        this.permissions = permissions;
        this.memberships = memberships;
        this.tenants = tenants;
        this.tenantScope = tenantScope;
    }

    /** 租户准入：会话主体与 API 令牌都可通过，各按自己的归属规则。 */
    public Resolution admit(String credential, UUID tenant) {
        return admit(principals.require(new Credential(credential)), tenant);
    }

    public Resolution admit(Resolution resolution, UUID tenant) {
        if (!resolution.permitsTenant(tenant)) throw new PermissionDeniedException();
        var status = tenants.status(new TenantId(tenant)).orElseThrow(PermissionDeniedException::new);
        if (status == TenantRegistryApi.Status.SUSPENDED) {
            throw new TenantSuspendedException();
        }
        var principal = resolution.principal();
        switch (principal.type()) {
            case TOKEN -> {
                boolean bound = resolution
                        .binding()
                        .map(binding -> binding.tenant().equals(tenant))
                        .orElse(false);
                if (!bound) throw new PermissionDeniedException();
            }
            case USER -> {
                if (principal.id() == null) throw new PermissionDeniedException();
                Resolution authenticated = resolution;
                resolution = inTenant(tenant, () -> enrichUser(authenticated, tenant));
            }
            default -> throw new PermissionDeniedException();
        }
        return resolution;
    }

    /**
     * Session User 的 Team 身份在一次 tenant admission 中展开并随 Resolution 传递。
     * 后续 guard、filter 与 allowedActions 共用同一个 Subject，避免逐资源回查 Membership。
     */
    private Resolution enrichUser(Resolution resolution, UUID tenant) {
        var member = new MembershipApi.MemberId(resolution.principal().id());
        if (!memberships.isMember(MembershipApi.Group.tenant(tenant), member)) {
            throw new PermissionDeniedException();
        }
        Set<Principal> teams = memberships.groupsOf(member).stream()
                .map(MembershipApi.Membership::group)
                .filter(group -> group.type() == MembershipApi.GroupType.TEAM)
                .filter(group -> group.tenantId().equals(tenant))
                .map(group -> new Principal(PrincipalType.TEAM, group.id()))
                .collect(Collectors.toUnmodifiableSet());
        return resolution.withAffiliations(teams);
    }

    /** 只有自然人成员才能做的事（创建空间、管理成员）：令牌即便绑定该租户也不行。 */
    public Resolution admitUser(String credential, UUID tenant) {
        var resolution = admit(credential, tenant);
        if (resolution.principal().type() != PrincipalType.USER) {
            throw new PermissionDeniedException();
        }
        return resolution;
    }

    /** 准入 + 按稳定 id 资源链的授权判定；链首必须是该租户根。 */
    public Resolution require(String credential, UUID tenant, List<Resource> chain, Operation operation) {
        var resolution = admit(credential, tenant);
        guard.require(resolution, requireRoot(chain, tenant), operation);
        return resolution;
    }

    public Resolution requireUser(String credential, UUID tenant, List<Resource> chain, Operation operation) {
        var resolution = admitUser(credential, tenant);
        guard.require(resolution, requireRoot(chain, tenant), operation);
        return resolution;
    }

    /** 已准入主体对某条链是否具备 operation；供计算 allowedActions，不重复冻结检查。 */
    public boolean allows(Resolution resolution, UUID tenant, List<Resource> chain, Operation operation) {
        return guard.decide(resolution, requireRoot(chain, tenant), operation);
    }

    /** 批量收窄：先按令牌 scope/binding 过滤，再在租户上下文内一次问 Permission.filter。 */
    public Set<List<Resource>> filter(
            Resolution resolution, UUID tenant, Set<List<Resource>> chains, Operation operation) {
        if (!resolution.permits(operation) || chains.isEmpty()) {
            return Set.of();
        }
        Set<List<Resource>> bound = chains.stream()
                .map(chain -> requireRoot(chain, tenant))
                .filter(chain -> PermissionGuard.bindingMatches(resolution, chain))
                .collect(Collectors.toUnmodifiableSet());
        if (bound.isEmpty()) {
            return Set.of();
        }
        return inTenant(tenant, () -> permissions.filter(bound, resolution.subject(), operation));
    }

    public <T> T inTenant(UUID tenant, Supplier<T> work) {
        return tenantScope.inTenant(new TenantId(tenant), work);
    }

    public void inTenant(UUID tenant, Runnable work) {
        tenantScope.inTenant(new TenantId(tenant), work);
    }

    public static Resource tenant(UUID tenant) {
        return new Resource(ResourceType.TENANT, tenant);
    }

    public static Resource space(UUID space) {
        return new Resource(ResourceType.SPACE, space);
    }

    public static Resource page(UUID page) {
        return new Resource(ResourceType.PAGE, page);
    }

    public static Resource team(UUID team) {
        return new Resource(ResourceType.TEAM, team);
    }

    public static Resource site(UUID site) {
        return new Resource(ResourceType.SITE, site);
    }

    /** 资源链恒以租户根开头；传入不含根的链是编程错误，不是业务拒绝。 */
    private static List<Resource> requireRoot(List<Resource> chain, UUID tenant) {
        if (chain.isEmpty()
                || chain.getFirst().type() != ResourceType.TENANT
                || !chain.getFirst().id().equals(tenant)) {
            throw new IllegalArgumentException("resource chain must start with the admitted tenant root");
        }
        return chain;
    }
}
