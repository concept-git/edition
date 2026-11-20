package io.space.control.compositions.platform.statistics;

import static io.space.control.compositions.platform.statistics.StatisticsTypes.*;

import io.space.concepts.analytics.api.AnalyticsApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.OperationNotFoundException;
import io.space.control.compositions.resource.ResourceChain;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SearchUseCase {
    private final AnalyticsApi analytics;

    private final TenantAccess tenants;
    private final ResourceChain resources;

    private final Clock clock;

    SearchUseCase(StatisticsDependencies dependencies) {
        this.analytics = dependencies.analytics;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.clock = dependencies.clock;
    }

    @Transactional(readOnly = true)
    public Search search(String credential, UUID tenant, UUID site, Instant from, Instant to) {
        var range = Range.of(from, to, clock);
        resources.site(tenant, site).orElseThrow(OperationNotFoundException::new);
        tenants.requireUser(
                credential, tenant, List.of(TenantAccess.tenant(tenant), TenantAccess.site(site)), TenantAccess.ADMIN);
        return tenants.inTenant(tenant, () -> Search.of(analytics.search(site, range.from(), range.to())));
    }
}
