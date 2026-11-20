package io.space.control.compositions.platform.operations;

import static io.space.control.compositions.platform.operations.OperationsTypes.*;

import io.space.concepts.audit.api.AuditApi;
import io.space.control.compositions.*;
import io.space.control.compositions.access.ManagementCapabilities;
import io.space.control.compositions.access.TenantAccess;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class CapabilitiesUseCase {
    private final io.space.concepts.space.api.SpaceApi spaces;
    private final io.space.concepts.site.api.SiteApi sites;

    private final AuditApi audit;

    private final TenantAccess tenants;

    CapabilitiesUseCase(OperationsDependencies dependencies) {
        this.spaces = dependencies.spaces;
        this.sites = dependencies.sites;
        this.audit = dependencies.audit;
        this.tenants = dependencies.tenants;
    }

    @Transactional(readOnly = true)
    public Capabilities capabilities(String credential, UUID tenant) {
        var who = tenants.admitUser(credential, tenant);
        return tenants.inTenant(tenant, () -> {
            boolean root = tenants.allows(who, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
            var spacesVisible = spaces.listByTenant(tenant).stream()
                    .filter(v -> tenants.allows(
                            who,
                            tenant,
                            List.of(TenantAccess.tenant(tenant), TenantAccess.space(v.id())),
                            TenantAccess.ADMIN))
                    .map(v -> new Choice(v.id(), v.name()))
                    .toList();
            var sitesVisible = sites.listByTenant(tenant).stream()
                    .filter(v -> tenants.allows(
                            who,
                            tenant,
                            List.of(TenantAccess.tenant(tenant), TenantAccess.site(v.id())),
                            TenantAccess.ADMIN))
                    .map(v -> new Choice(v.id(), v.name()))
                    .toList();
            return new Capabilities(
                    root && ManagementCapabilities.permits(who, "audit:read"),
                    root && ManagementCapabilities.permits(who, "hosting:write"),
                    root && ManagementCapabilities.permits(who, "content:read"),
                    spacesVisible,
                    sitesVisible);
        });
    }
}
