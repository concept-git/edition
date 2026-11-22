package io.edition.control.usecases.platform.statistics;

import static io.edition.control.usecases.platform.statistics.StatisticsTypes.*;

import io.edition.control.modules.analytics.api.AnalyticsApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.OperationNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class TrafficUseCase {
    private final AnalyticsApi analytics;

    private final TenantAccess tenants;
    private final ResourceChain resources;

    private final Clock clock;

    TrafficUseCase(StatisticsDependencies dependencies) {
        this.analytics = dependencies.analytics;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.clock = dependencies.clock;
    }

    @Transactional(readOnly = true)
    public Traffic traffic(String credential, UUID tenant, UUID site, Instant from, Instant to, String granularity) {
        var range = Range.of(from, to, clock);
        if (granularity == null
                || !Set.of("hour", "day").contains(granularity)
                || granularity.equals("hour")
                        && Duration.between(range.from(), range.to()).compareTo(Duration.ofDays(31)) > 0)
            throw new StatisticsInputInvalid("granularity");
        resources.site(tenant, site).orElseThrow(OperationNotFoundException::new);
        tenants.requireUser(
                credential, tenant, List.of(TenantAccess.tenant(tenant), TenantAccess.site(site)), TenantAccess.ADMIN);
        return tenants.inTenant(
                tenant, () -> Traffic.of(analytics.traffic(site, range.from(), range.to(), granularity)));
    }
}
