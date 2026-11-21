package io.edition.concepts.analytics.api;

import io.edition.delivery.contract.TelemetryEvent;
import java.time.Instant;
import java.util.*;

public interface AnalyticsApi {
    void retain(Instant trafficBefore, Instant activityBefore);

    void ingest(List<TelemetryEvent> events);

    void activity(UUID tenant, UUID space, UUID page, UUID actor, String kind, Instant time);

    UsageActivity usageActivity(UUID space, Instant from, Instant to);

    Traffic traffic(UUID site, Instant from, Instant to, String granularity);

    Search search(UUID site, Instant from, Instant to);

    Map<String, Long> redirectHits(UUID site, Instant from);

    record UsageActivity(long promotions, long activeAuthors) {}

    record Bucket(Instant time, long pv, long uv) {}

    record Ranked(String label, long count) {}

    record Health(String status, Instant updatedAt, boolean lossDetected, long staleSources, Instant retainedFrom) {}

    record Traffic(
            long pv,
            List<Bucket> series,
            List<Ranked> pages,
            List<Ranked> notFound,
            List<Ranked> referrers,
            Health health) {}

    record Search(
            long searches,
            long observable,
            long clicked,
            Double clickRate,
            List<Ranked> popular,
            List<Ranked> zeroResults,
            Health health) {}
}
