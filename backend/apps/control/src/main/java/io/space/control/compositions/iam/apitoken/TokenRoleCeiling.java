package io.space.control.compositions.iam.apitoken;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * 令牌角色上限：issuer 必须是该空间 admin，且所请求角色的 Operation 集
 * ⊆ issuer 的有效角色 Operation 集。按包含关系判定，不按角色名排序。
 */
@Component
class TokenRoleCeiling {

    private final TenantAccess tenants;
    private final PermissionApi permissions;
    private final SpaceApi spaces;

    TokenRoleCeiling(TenantAccess tenants, PermissionApi permissions, SpaceApi spaces) {
        this.tenants = tenants;
        this.permissions = permissions;
        this.spaces = spaces;
    }

    static List<Resource> chain(UUID tenant, UUID space) {
        return List.of(TenantAccess.tenant(tenant), TenantAccess.space(space));
    }

    PermissionApi.Role allowedRole(UUID tenant, UUID space, Resolution issuer, String requestedRole) {
        var chain = chain(tenant, space);
        if (!tenants.allows(issuer, tenant, chain, TenantAccess.ADMIN)) {
            throw new PermissionDeniedException();
        }
        return tenants.inTenant(tenant, () -> {
            var effective = permissions
                    .decide(chain, issuer.subject(), TenantAccess.ADMIN)
                    .effectiveOperations();
            var requested = new PermissionApi.Role(requestedRole);
            Set<PermissionApi.Operation> requestedOperations = permissions.operations(requested);
            if (requestedOperations.isEmpty()) {
                throw new ApiTokenTypes.TokenRoleInvalidException();
            }
            if (!effective.containsAll(requestedOperations)) {
                throw new ApiTokenTypes.RoleEscalationForbiddenException();
            }
            return requested;
        });
    }

    Set<UUID> administeredSpaces(UUID tenant, Resolution actor) {
        Set<List<Resource>> chains = tenants.inTenant(tenant, () -> spaces.listByTenant(tenant)).stream()
                .map(space -> chain(tenant, space.id()))
                .collect(Collectors.toUnmodifiableSet());
        return tenants.filter(actor, tenant, chains, TenantAccess.ADMIN).stream()
                .map(List::getLast)
                .map(Resource::id)
                .collect(Collectors.toUnmodifiableSet());
    }

    String role(ApiTokenApi.Metadata token) {
        var principal = new PermissionApi.Principal(
                PermissionApi.PrincipalType.TOKEN, token.id().value());
        return tenants.inTenant(
                token.tenantId(),
                () -> permissions
                        .effectiveRole(chain(token.tenantId(), token.spaceId()), principal)
                        .map(PermissionApi.Role::value)
                        .orElse(""));
    }
}
