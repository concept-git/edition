package io.edition.control.usecases.hosting.sitedelivery;

import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import java.util.*;

@org.springframework.stereotype.Component
final class SiteDeliveryDependencies {
    final TenantAccess tenants;
    final SiteApi sites;
    final PrimaryDelivery primary;
    final IdempotentFlowExecutor idempotency;

    SiteDeliveryDependencies(
            TenantAccess tenants, SiteApi sites, PrimaryDelivery primary, IdempotentFlowExecutor idempotency) {
        this.tenants = tenants;
        this.sites = sites;
        this.primary = primary;
        this.idempotency = idempotency;
    }
}
