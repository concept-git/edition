package io.edition.control.usecases.platform.tenant;

import static io.edition.control.usecases.platform.tenant.TenantTypes.*;

import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.usecases.access.PlatformOperatorGuard;
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
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            platformOperator.require(credential);
            tenants.resume(tenantLookup.tenantNotFound(tenant));
        }
    }
}
