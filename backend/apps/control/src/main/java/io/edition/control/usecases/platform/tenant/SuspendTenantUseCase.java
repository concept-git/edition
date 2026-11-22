package io.edition.control.usecases.platform.tenant;

import static io.edition.control.usecases.platform.tenant.TenantTypes.*;

import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SuspendTenantUseCase {

    private final TenantLookup tenantLookup;
    private final PlatformOperatorGuard platformOperator;
    private final TenantRegistryApi tenants;

    SuspendTenantUseCase(TenantDependencies dependencies) {
        this.tenantLookup = dependencies.tenantLookup;
        this.platformOperator = dependencies.platformOperator;
        this.tenants = dependencies.tenants;
    }

    @Transactional
    public void suspendTenant(String credential, UUID tenant) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            platformOperator.require(credential);
            tenants.suspend(tenantLookup.tenantNotFound(tenant));
        }
    }
}
