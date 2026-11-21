package io.edition.control.compositions.platform.statistics;

import static io.edition.control.compositions.platform.statistics.StatisticsTypes.*;

import io.edition.concepts.analytics.api.AnalyticsApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.control.compositions.access.PermissionDeniedException;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.delivery.contract.TelemetryEvent;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class IngestUseCase {
    private final AnalyticsApi analytics;

    private final TenantAccess tenants;

    private final SiteApi sites;
    private final Clock clock;
    private final byte[] ingestKey;

    IngestUseCase(StatisticsDependencies dependencies) {
        this.analytics = dependencies.analytics;
        this.tenants = dependencies.tenants;
        this.sites = dependencies.sites;
        this.clock = dependencies.clock;
        this.ingestKey = dependencies.ingestKey;
    }

    @Transactional
    public Accepted ingest(String credential, List<TelemetryEvent> events) {
        if (ingestKey.length < 32
                || credential == null
                || !java.security.MessageDigest.isEqual(
                        ingestKey, credential.getBytes(java.nio.charset.StandardCharsets.UTF_8)))
            throw new PermissionDeniedException();
        if (events == null || events.size() > 500) throw new StatisticsInputInvalid("events");
        var groups = new HashMap<UUID, List<TelemetryEvent>>();
        for (var e : events) {
            if (e == null
                    || e.id() == null
                    || e.sourceId() == null
                    || e.time() == null
                    || e.time().isAfter(clock.instant().plusSeconds(300))
                    || e.dropped() < 0
                    || e.type() == null
                    || !Set.of(
                                    "collector_heartbeat",
                                    "heartbeat",
                                    "pv",
                                    "notfound",
                                    "redirect",
                                    "search",
                                    "click",
                                    "observable")
                            .contains(e.type())) throw new StatisticsInputInvalid("events");
            if (e.type().equals("heartbeat") || e.type().equals("collector_heartbeat")) {
                analytics.ingest(List.of(e));
                continue;
            }
            if (e.tenantId() == null || e.siteId() == null) throw new StatisticsInputInvalid("events");
            groups.computeIfAbsent(e.tenantId(), ignored -> new ArrayList<>()).add(e);
        }
        for (var group : groups.entrySet())
            tenants.inTenant(group.getKey(), () -> {
                var known = new HashSet<UUID>();
                for (var site : group.getValue().stream()
                        .map(TelemetryEvent::siteId)
                        .distinct()
                        .toList())
                    if (sites.tenantOf(new SiteApi.SiteId(site))
                            .filter(group.getKey()::equals)
                            .isPresent()) known.add(site);
                analytics.ingest(group.getValue().stream()
                        .filter(e -> known.contains(e.siteId()))
                        .toList());
            });
        return new Accepted(events.size());
    }
}
