package io.edition.control.compositions.hosting.sitedelivery;

import io.edition.concepts.site.api.SiteApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
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
