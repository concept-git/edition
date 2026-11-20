package io.space.control.compositions.platform.statistics;

import static io.space.control.compositions.platform.statistics.StatisticsTypes.*;

import io.space.concepts.analytics.api.AnalyticsApi;
import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.resource.ResourceChain;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;

@org.springframework.stereotype.Component
final class StatisticsDependencies {
    final AnalyticsApi analytics;
    final UsageProjection usage;
    final TenantAccess tenants;
    final ResourceChain resources;
    final SiteApi sites;
    final Clock clock;
    final byte[] ingestKey;

    public StatisticsDependencies(
            AnalyticsApi analytics,
            UsageProjection usage,
            TenantAccess tenants,
            ResourceChain resources,
            SiteApi sites,
            Clock clock,
            @Value("${io.space.analytics.ingest-key:}") String key) {
        this.analytics = analytics;
        this.usage = usage;
        this.tenants = tenants;
        this.resources = resources;
        this.sites = sites;
        this.clock = clock;
        this.ingestKey = key.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
