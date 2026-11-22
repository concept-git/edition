package io.edition.control.usecases.platform.search;

import static io.edition.control.usecases.platform.search.SearchTypes.*;

import io.edition.control.modules.audit.api.AuditApi;
import io.edition.control.modules.search.api.SearchApi;
import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.*;

@org.springframework.stereotype.Component
final class SearchDependencies {
    final SearchApi search;
    final SiteApi sites;
    final TenantAccess tenants;
    final PlatformOperatorGuard operators;
    final ResourceChain resources;
    final IdempotentFlowExecutor idempotency;
    final AuditApi audit;

    public SearchDependencies(
            SearchApi search,
            SiteApi sites,
            TenantAccess tenants,
            PlatformOperatorGuard operators,
            ResourceChain resources,
            IdempotentFlowExecutor idempotency,
            AuditApi audit) {
        this.search = search;
        this.sites = sites;
        this.tenants = tenants;
        this.operators = operators;
        this.resources = resources;
        this.idempotency = idempotency;
        this.audit = audit;
    }
}
