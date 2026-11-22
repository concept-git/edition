package io.edition.control.usecases.hosting.sitedelivery;

import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.SiteNotFoundException;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RetryDeliveryUseCase {
    private final TenantAccess tenants;
    private final SiteApi sites;
    private final PrimaryDelivery primary;
    private final IdempotentFlowExecutor idempotency;

    RetryDeliveryUseCase(SiteDeliveryDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.sites = dependencies.sites;
        this.primary = dependencies.primary;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public void retryDelivery(String credential, UUID tenant, UUID site, String key) {
        var resolution = tenants.requireUser(
                credential, tenant, List.of(TenantAccess.tenant(tenant), TenantAccess.site(site)), TenantAccess.ADMIN);
        tenants.inTenant(tenant, () -> {
            sites.view(new SiteApi.SiteId(site))
                    .filter(s -> s.tenantId().equals(tenant))
                    .orElseThrow(SiteNotFoundException::new);
            idempotency.execute(
                    resolution.principal(),
                    key,
                    "delivery.retry",
                    IdempotentFlowExecutor.canonical(tenant, site),
                    () -> primary.retry(site));
            return null;
        });
    }
}
