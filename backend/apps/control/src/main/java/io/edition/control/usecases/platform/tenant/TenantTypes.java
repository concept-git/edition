package io.edition.control.usecases.platform.tenant;

import static io.edition.control.usecases.platform.tenant.TenantTypes.*;

import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class TenantTypes {
    private TenantTypes() {}

    public record TenantView(UUID id, String name, String status, long ownerCount, Instant createdAt) {

        static TenantView of(TenantRegistryApi.View tenant, long ownerCount) {
            return new TenantView(
                    tenant.id().value(),
                    tenant.name(),
                    tenant.status().name().toLowerCase(Locale.ROOT),
                    ownerCount,
                    tenant.createdAt());
        }
    }

    public record Provisioned(TenantView tenant, String ownerInviteToken) {}

    public record Tenants(List<TenantView> tenants, String nextCursor) {
        public Tenants {
            tenants = List.copyOf(tenants);
        }
    }
}
