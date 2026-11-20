package io.space.control.compositions.platform.tenant;

import static io.space.control.compositions.platform.tenant.TenantTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.control.compositions.access.PlatformOperatorGuard;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListTenantsUseCase {

    private final PlatformOperatorGuard platformOperator;
    private final TenantRegistryApi tenants;
    private final TenantScopeApi tenantScope;
    private final MembershipApi memberships;

    ListTenantsUseCase(TenantDependencies dependencies) {
        this.platformOperator = dependencies.platformOperator;
        this.tenants = dependencies.tenants;
        this.tenantScope = dependencies.tenantScope;
        this.memberships = dependencies.memberships;
    }

    @Transactional(readOnly = true)
    public Tenants listTenants(String credential, String cursor, int limit) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            platformOperator.require(credential);
            var page = tenants.list(cursor, limit);
            // 平台面自身跨租户；owner 数须逐租户进入其上下文读取（iam.memberships 受 RLS 保护）。
            return new Tenants(
                    page.tenants().stream()
                            .map(tenant -> TenantView.of(
                                    tenant,
                                    tenantScope.inTenant(
                                            tenant.id(),
                                            () -> memberships.ownerCount(
                                                    Group.tenant(tenant.id().value())))))
                            .toList(),
                    page.nextCursor());
        }
    }
}
