package io.space.control.compositions.hosting.sitedelivery;

import static io.space.control.compositions.hosting.sitedelivery.SiteDeliveryTypes.*;

import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.resource.SiteNotFoundException;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DeliveryStatusUseCase {
    private final TenantAccess tenants;
    private final SiteApi sites;
    private final PrimaryDelivery primary;

    DeliveryStatusUseCase(SiteDeliveryDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.sites = dependencies.sites;
        this.primary = dependencies.primary;
    }

    @Transactional(readOnly = true)
    public Status deliveryStatus(String credential, UUID tenant, UUID site) {
        var resolution = tenants.requireUser(
                credential, tenant, List.of(TenantAccess.tenant(tenant), TenantAccess.site(site)), TenantAccess.READ);
        return tenants.inTenant(tenant, () -> {
            sites.view(new SiteApi.SiteId(site))
                    .filter(s -> s.tenantId().equals(tenant))
                    .orElseThrow(SiteNotFoundException::new);
            boolean canRetry =
                    io.space.control.compositions.access.ManagementCapabilities.permits(resolution, "hosting:write")
                            && tenants.allows(
                                    resolution,
                                    tenant,
                                    List.of(TenantAccess.tenant(tenant), TenantAccess.site(site)),
                                    TenantAccess.ADMIN);
            return primary.status(site, canRetry);
        });
    }
}
