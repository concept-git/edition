package io.edition.control.compositions.platform.statistics;

import static io.edition.control.compositions.platform.statistics.StatisticsTypes.*;

import io.edition.concepts.analytics.api.AnalyticsApi;
import java.time.*;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class StatisticsTypes {
    private StatisticsTypes() {}

    public record Range(Instant from, Instant to) {
        static Range of(Instant from, Instant to, Clock clock) {
            var end = to == null
                    ? LocalDate.now(clock.withZone(ZoneOffset.UTC))
                            .plusDays(1)
                            .atStartOfDay(ZoneOffset.UTC)
                            .toInstant()
                    : to;
            var start = from == null ? end.minus(Duration.ofDays(30)) : from;
            if (!start.isBefore(end) || Duration.between(start, end).compareTo(Duration.ofDays(366)) > 0)
                throw new StatisticsInputInvalid("from");
            return new Range(start, end);
        }
    }

    public record Accepted(int accepted) {}

    public record Usage(
            long workingPages,
            long trashedPages,
            long publishedPages,
            long workingTextBytes,
            long trashedTextBytes,
            long attachmentCount,
            long attachmentBytes,
            long releases,
            long snapshotPages,
            long snapshotTextBytes,
            long promotions,
            long activeAuthors,
            Map<String, Long> imports,
            Instant computedAt) {}

    public record Bucket(Instant time, long pv, long uv) {
        static Bucket of(AnalyticsApi.Bucket b) {
            return new Bucket(b.time(), b.pv(), b.uv());
        }
    }

    public record Ranked(String label, long count) {
        static Ranked of(AnalyticsApi.Ranked r) {
            return new Ranked(r.label(), r.count());
        }
    }

    public record Health(
            String status, Instant updatedAt, boolean lossDetected, long staleSources, Instant retainedFrom) {
        static Health of(AnalyticsApi.Health h) {
            return new Health(h.status(), h.updatedAt(), h.lossDetected(), h.staleSources(), h.retainedFrom());
        }
    }

    public record Traffic(
            long pv,
            List<Bucket> series,
            List<Ranked> pages,
            List<Ranked> notFound,
            List<Ranked> referrers,
            Health health) {
        static Traffic of(AnalyticsApi.Traffic t) {
            return new Traffic(
                    t.pv(),
                    t.series().stream().map(Bucket::of).toList(),
                    t.pages().stream().map(Ranked::of).toList(),
                    t.notFound().stream().map(Ranked::of).toList(),
                    t.referrers().stream().map(Ranked::of).toList(),
                    Health.of(t.health()));
        }
    }

    public record Search(
            long searches,
            long observable,
            long clicked,
            Double clickRate,
            List<Ranked> popular,
            List<Ranked> zeroResults,
            Health health) {
        static Search of(AnalyticsApi.Search s) {
            return new Search(
                    s.searches(),
                    s.observable(),
                    s.clicked(),
                    s.clickRate(),
                    s.popular().stream().map(Ranked::of).toList(),
                    s.zeroResults().stream().map(Ranked::of).toList(),
                    Health.of(s.health()));
        }
    }
}
