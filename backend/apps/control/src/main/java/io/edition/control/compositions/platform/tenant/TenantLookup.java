package io.edition.control.compositions.platform.tenant;

import static io.edition.control.compositions.platform.tenant.TenantTypes.*;

import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi.TenantId;
import java.util.UUID;

/** Shared entry policy or read projection; no independent causal invocation. */
@org.springframework.stereotype.Component
final class TenantLookup {
    private final TenantRegistryApi tenants;

    TenantLookup(TenantRegistryApi tenants) {
        this.tenants = tenants;
    }

    TenantId tenantNotFound(UUID tenant) {
        var id = new TenantId(tenant);
        if (tenants.status(id).isEmpty()) {
            throw new TenantNotFoundException();
        }
        return id;
    }
}
