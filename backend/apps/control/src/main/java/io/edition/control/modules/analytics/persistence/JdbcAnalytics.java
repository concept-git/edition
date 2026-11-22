package io.edition.control.modules.analytics.persistence;

import io.edition.control.modules.analytics.api.*;
import io.edition.control.modules.analytics.api.AnalyticsApi;
import io.edition.delivery.contract.TelemetryEvent;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAnalytics implements AnalyticsApi {
    private final JdbcTemplate jdbc;
    private final java.time.Clock clock;

    public JdbcAnalytics(JdbcTemplate jdbc, java.time.Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    public void retain(Instant trafficBefore, Instant activityBefore) {
        jdbc.update("delete from shared.analytics_events where occurred_at<?", Timestamp.from(trafficBefore));
        jdbc.update("delete from shared.analytics_activity where occurred_at<?", Timestamp.from(activityBefore));
    }

    public void ingest(List<TelemetryEvent> events) {
        for (var e : events) {
            jdbc.update(
                    "insert into shared.analytics_sources(id,last_seen,dropped,collector)"
                            + " values(?,?,?,?) on conflict(id) do update set"
                            + " last_seen=greatest(shared.analytics_sources.last_seen,excluded.last_seen),dropped=greatest(shared.analytics_sources.dropped,excluded.dropped),collector=shared.analytics_sources.collector"
                            + " or excluded.collector",
                    e.sourceId(),
                    Timestamp.from(e.time()),
                    e.dropped(),
                    e.type().equals("collector_heartbeat"));
            if (e.type().equals("heartbeat") || e.type().equals("collector_heartbeat")) continue;
            jdbc.update(
                    """
                    insert into shared.analytics_events(id,source_id,occurred_at,tenant_id,site_id,page_id,type,path,query,search_id,visitor,referrer,zero)
                    values(?,?,?,?,?,?,?,?,?,?,?,?,?) on conflict(id) do nothing
                    """,
                    e.id(),
                    e.sourceId(),
                    Timestamp.from(e.time()),
                    e.tenantId(),
                    e.siteId(),
                    e.pageId(),
                    e.type(),
                    e.path(),
                    e.query(),
                    e.searchId(),
                    e.visitor(),
                    e.referrer(),
                    e.zero());
        }
    }

    public void activity(UUID tenant, UUID space, UUID page, UUID actor, String kind, Instant time) {
        jdbc.update(
                "insert into"
                        + " shared.analytics_activity(tenant_id,space_id,page_id,actor_id,kind,occurred_at)"
                        + " values(?,?,?,?,?,?)",
                tenant,
                space,
                page,
                actor,
                kind,
                Timestamp.from(time));
    }

    public UsageActivity usageActivity(UUID space, Instant from, Instant to) {
        return jdbc.queryForObject(
                "select count(*) filter(where kind='promote'),count(distinct actor_id) filter(where"
                        + " kind='edit') from shared.analytics_activity where (?::uuid is null or"
                        + " space_id=?) and occurred_at>=? and occurred_at<?",
                (r, n) -> new UsageActivity(r.getLong(1), r.getLong(2)),
                space,
                space,
                Timestamp.from(from),
                Timestamp.from(to));
    }

    public Traffic traffic(UUID site, Instant from, Instant to, String granularity) {
        if (!Set.of("hour", "day").contains(granularity)) throw new IllegalArgumentException("invalid granularity");
        String grain = granularity.equals("hour") ? "hour" : "day";
        String sql = "with counts as (select date_trunc('"
                + grain
                + "',occurred_at at time zone 'UTC') at time zone 'UTC' as bucket,count(*)"
                + " pv,count(distinct visitor) uv from shared.analytics_events where"
                + " site_id=? and type='pv' and occurred_at>=? and occurred_at<? group by"
                + " 1) select buckets.t,coalesce(c.pv,0),coalesce(c.uv,0) from"
                + " generate_series(date_trunc('"
                + grain
                + "',?::timestamptz at time zone 'UTC') at time zone"
                + " 'UTC',?::timestamptz-interval '1 microsecond',interval '1 "
                + grain
                + "') buckets(t) left join counts c on c.bucket=buckets.t order by"
                + " buckets.t";
        var series = jdbc.query(
                sql,
                (r, n) -> new Bucket(r.getTimestamp(1).toInstant(), r.getLong(2), r.getLong(3)),
                site,
                Timestamp.from(from),
                Timestamp.from(to),
                Timestamp.from(from),
                Timestamp.from(to));
        return new Traffic(
                series.stream().mapToLong(Bucket::pv).sum(),
                series,
                rank(site, from, to, "pv", "path", false),
                rank(site, from, to, "notfound", "path", false),
                rank(site, from, to, "pv", "referrer", false),
                health(site, from));
    }

    public Search search(UUID site, Instant from, Instant to) {
        var counts = jdbc.queryForObject(
                """
                        with searches as (select distinct search_id from shared.analytics_events where site_id=? and type='search' and occurred_at>=? and occurred_at<?)
                        select count(*),count(*) filter(where exists(select 1 from shared.analytics_events e where e.site_id=? and e.search_id=s.search_id and e.type in ('observable','click'))),
                        count(*) filter(where exists(select 1 from shared.analytics_events e where e.site_id=? and e.search_id=s.search_id and e.type='click')) from searches s
                        """,
                (r, n) -> new long[] {r.getLong(1), r.getLong(2), r.getLong(3)},
                site,
                Timestamp.from(from),
                Timestamp.from(to),
                site,
                site);
        return new Search(
                counts[0],
                counts[1],
                counts[2],
                counts[1] == 0 ? null : (double) counts[2] / counts[1],
                rank(site, from, to, "search", "query", true),
                rank(site, from, to, "zero", "query", true),
                health(site, from));
    }

    private List<Ranked> rank(UUID site, Instant from, Instant to, String type, String field, boolean sessions) {
        if (!Set.of("path", "query", "referrer").contains(field)) throw new IllegalArgumentException();
        return jdbc.query(
                "select "
                        + field
                        + ","
                        + (sessions ? "count(distinct search_id)" : "count(*)")
                        + " as hits from shared.analytics_events where site_id=? and type=? and"
                        + " occurred_at>=? and occurred_at<? and "
                        + field
                        + " is not null"
                        + (type.equals("zero") ? " and zero" : "")
                        + " group by "
                        + field
                        + " order by hits desc,"
                        + field
                        + " limit 20",
                (r, n) -> new Ranked(r.getString(1), r.getLong(2)),
                site,
                type.equals("zero") ? "search" : type,
                Timestamp.from(from),
                Timestamp.from(to));
    }

    public Map<String, Long> redirectHits(UUID site, Instant from) {
        var map = new LinkedHashMap<String, Long>();
        jdbc.query(
                "select path,count(*) from shared.analytics_events where site_id=? and"
                        + " type='redirect' and occurred_at>=? group by path",
                (org.springframework.jdbc.core.RowCallbackHandler) r -> map.put(r.getString(1), r.getLong(2)),
                site,
                Timestamp.from(from));
        return map;
    }

    private Health health(UUID site, Instant from) {
        boolean observed = Boolean.TRUE.equals(jdbc.queryForObject(
                "select exists(select 1 from shared.analytics_events where" + " site_id=?)", Boolean.class, site));
        var retainedFrom = clock.instant().minus(java.time.Duration.ofDays(30));
        var rows = jdbc.query(
                "select max(s.last_seen),bool_or(s.dropped>0),count(*) filter(where"
                        + " s.last_seen<now()-interval '1 minute') from"
                        + " shared.analytics_sources s where s.collector or exists(select 1"
                        + " from shared.analytics_events e where e.site_id=? and"
                        + " e.source_id=s.id)",
                (r, n) -> new Health(
                        !observed || r.getTimestamp(1) == null
                                ? "no_data"
                                : r.getLong(3) > 0
                                        ? "delayed"
                                        : r.getBoolean(2) || from.isBefore(retainedFrom) ? "partial" : "ready",
                        r.getTimestamp(1) == null ? null : r.getTimestamp(1).toInstant(),
                        r.getBoolean(2),
                        r.getLong(3),
                        retainedFrom),
                site);
        return rows.getFirst();
    }
}
