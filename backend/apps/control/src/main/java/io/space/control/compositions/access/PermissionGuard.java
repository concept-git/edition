package io.space.control.compositions.access;

import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.permission.api.PermissionApi.Operation;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.permission.api.PermissionApi.ResourceType;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.control.compositions.principal.PrincipalResolution;
import io.space.control.compositions.principal.PrincipalResolver.Credential;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.control.compositions.principal.UnresolvedPrincipalException;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;
import org.springframework.stereotype.Component;

/**
 * 管理面共用的鉴权接力（syncs/SYNCS.md「通用前置：guard 模板」）：主体 → scope → 冻结 → Permission。
 *
 * <p>Permission 的授权表受 RLS 保护，判定必须在链首租户的上下文内执行；本类替调用方完成这一步，
 * 于是"忘了包 inTenant"不再是一类可能的错误。冻结检查也在这里单点执行：平台运维面不走资源链，
 * 因此天然豁免（否则无法 resume）。HTTP 的 401/403 映射仍属于 gateway。
 */
@Component
public final class PermissionGuard {

    private final PrincipalResolution principals;
    private final PermissionApi permissions;
    private final TenantRegistryApi tenants;
    private final TenantScopeApi tenantScope;

    public PermissionGuard(
            PrincipalResolution principals,
            PermissionApi permissions,
            TenantRegistryApi tenants,
            TenantScopeApi tenantScope) {
        this.principals = principals;
        this.permissions = permissions;
        this.tenants = tenants;
        this.tenantScope = tenantScope;
    }

    public Result check(Credential credential, List<Resource> chain, Operation operation) {
        return principals
                .find(credential)
                .map(resolution -> check(resolution, chain, operation))
                .orElse(Result.UNRESOLVED);
    }

    /** 已解析主体的完整判定：token scope → token binding → 租户冻结 → Permission.decide。 */
    public Result check(Resolution resolution, List<Resource> chain, Operation operation) {
        if (!resolution.permits(operation) || !bindingMatches(resolution, chain)) {
            return Result.DENY;
        }
        if (isSuspended(chain)) {
            return Result.TENANT_SUSPENDED;
        }
        return decide(resolution, chain, operation) ? Result.ALLOW : Result.DENY;
    }

    /**
     * 不含冻结检查的纯授权判定，供已通过 {@link TenantAccess#admit} 的调用方批量计算可见动作，
     * 避免每个条目再查一次租户状态。
     */
    public boolean decide(Resolution resolution, List<Resource> chain, Operation operation) {
        if (!resolution.permits(operation) || !bindingMatches(resolution, chain)) {
            return false;
        }
        // chain 必须保持"租户→站点→空间→页面"的外围到内层顺序，不能排序或换成 slug。
        return inChainScope(
                chain,
                () -> permissions
                        .decide(List.copyOf(chain), resolution.subject(), operation)
                        .allowed());
    }

    public void require(Credential credential, List<Resource> chain, Operation operation) {
        raise(check(credential, chain, operation));
    }

    public void require(Resolution resolution, List<Resource> chain, Operation operation) {
        raise(check(resolution, chain, operation));
    }

    /** API 令牌只对其唯一 tenant/space 绑定有效：链上必须同时出现这两个资源。 */
    public static boolean bindingMatches(Resolution resolution, List<Resource> chain) {
        if (resolution.managementCredential().map(c -> c.tenantId() != null).orElse(false)) {
            if (chain.isEmpty()
                    || chain.getFirst().type() != ResourceType.TENANT
                    || !resolution.permitsTenant(chain.getFirst().id())) return false;
        }
        if (resolution.binding().isEmpty()) return true;
        var binding = resolution.binding().orElseThrow();
        return chain.stream()
                        .anyMatch(resource -> resource.type() == ResourceType.TENANT
                                && resource.id().equals(binding.tenant()))
                && chain.stream()
                        .anyMatch(resource -> resource.type() == ResourceType.SPACE
                                && resource.id().equals(binding.space()));
    }

    private static void raise(Result result) {
        switch (result) {
            case UNRESOLVED -> throw new UnresolvedPrincipalException();
            case TENANT_SUSPENDED -> throw new TenantSuspendedException();
            case DENY -> throw new PermissionDeniedException();
            case ALLOW -> {}
        }
    }

    private boolean isSuspended(List<Resource> chain) {
        return tenantRoot(chain)
                .flatMap(tenant -> tenants.status(new TenantRegistryApi.TenantId(tenant.id())))
                .filter(status -> status == TenantRegistryApi.Status.SUSPENDED)
                .isPresent();
    }

    private <T> T inChainScope(List<Resource> chain, Supplier<T> work) {
        return tenantRoot(chain)
                .map(tenant -> tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), work))
                .orElseGet(work);
    }

    private static Optional<Resource> tenantRoot(List<Resource> chain) {
        return chain.isEmpty() || chain.getFirst().type() != ResourceType.TENANT
                ? Optional.empty()
                : Optional.of(chain.getFirst());
    }

    public enum Result {
        ALLOW,
        DENY,
        UNRESOLVED,
        TENANT_SUSPENDED
    }
}
