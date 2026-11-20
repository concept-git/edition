package io.space.control.compositions.platform.tenant;

import static io.space.control.compositions.platform.tenant.TenantTypes.*;

import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.control.compositions.access.PlatformOperatorGuard;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ResumeTenantUseCase {

    private final TenantLookup tenantLookup;
    private final PlatformOperatorGuard platformOperator;
    private final TenantRegistryApi tenants;

    ResumeTenantUseCase(TenantDependencies dependencies) {
        this.tenantLookup = dependencies.tenantLookup;
        this.platformOperator = dependencies.platformOperator;
        this.tenants = dependencies.tenants;
    }

    @Transactional
    public void resumeTenant(String credential, UUID tenant) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            platformOperator.require(credential);
            tenants.resume(tenantLookup.tenantNotFound(tenant));
        }
    }
}
