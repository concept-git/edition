package io.space.control.compositions.platform.search;

import static io.space.control.compositions.platform.search.SearchTypes.*;

import io.space.concepts.audit.api.AuditApi;
import io.space.concepts.search.api.SearchApi;
import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.*;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;
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
