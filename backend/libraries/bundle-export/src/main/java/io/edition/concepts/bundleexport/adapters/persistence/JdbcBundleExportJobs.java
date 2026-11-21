package io.edition.concepts.bundleexport.adapters.persistence;

import io.edition.concepts.bundleexport.api.*;
import io.edition.concepts.bundleexport.api.BundleExportJobs;
import io.edition.concepts.bundleexport.api.ExportSnapshot;
import io.edition.shared.KeysetCursor;
import io.edition.shared.PageWindow;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;

@Repository
class JdbcBundleExportJobs implements BundleExportJobs {
    private static final String COLUMNS =
            "id,space_id,release_id,case when expires_at<=now() and status<>'cancelled' then"
                    + " 'expired' else status end"
                    + " visible_status,attempts,error,trace_id,created_at,expires_at,output_bytes";
    private final JdbcTemplate jdbc;
    private final JsonMapper json;

    JdbcBundleExportJobs(JdbcTemplate jdbc, JsonMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    @Override
    public View enqueue(
            UUID id, UUID tenant, UUID space, UUID release, ExportSnapshot snapshot, Instant expiresAt, String trace) {
        String[] objects = snapshot.pages().stream()
                .flatMap(p -> p.attachments().stream())
                .map(ExportSnapshot.Attachment::storageKey)
                .distinct()
                .sorted()
                .toArray(String[]::new);
        jdbc.update(
                "insert into"
                        + " shared.bundle_exports(id,tenant_id,space_id,release_id,snapshot,page_ids,object_keys,expires_at,trace_id)"
                        + " values(?,?,?,?,?::jsonb,?,?,?,?)",
                id,
                tenant,
                space,
                release,
                json.writeValueAsString(snapshot),
                new org.springframework.jdbc.support.SqlArrayValue(
                        "uuid",
                        snapshot.pages().stream().map(ExportSnapshot.Page::id).toArray()),
                new org.springframework.jdbc.support.SqlArrayValue("text", (Object[]) objects),
                Timestamp.from(expiresAt),
                trace);
        return view(space, id).orElseThrow();
    }

    @Override
    public Optional<Stored> find(UUID space, UUID id) {
        return jdbc
                .query(
                        "select "
                                + COLUMNS
                                + ",page_ids,output_key from shared.bundle_exports where space_id=?"
                                + " and id=?",
                        (r, n) -> new Stored(
                                VIEWS.mapRow(r, n),
                                Set.of((UUID[]) r.getArray("page_ids").getArray()),
                                r.getString("output_key")),
                        space,
                        id)
                .stream()
                .findFirst();
    }

    @Override
    public Optional<View> view(UUID space, UUID id) {
        return jdbc
                .query("select " + COLUMNS + " from shared.bundle_exports where space_id=? and id=?", VIEWS, space, id)
                .stream()
                .findFirst();
    }

    @Override
    public Page list(UUID space, UUID release, String cursor, int limit) {
        var after = KeysetCursor.decode(cursor).orElse(null);
        var at = after == null ? null : Timestamp.from(after.at());
        var rows = jdbc.query(
                "select "
                        + COLUMNS
                        + " from shared.bundle_exports where space_id=? and (?::uuid is"
                        + " null or release_id=?::uuid) and (?::timestamptz is null or"
                        + " (created_at,id)<(?::timestamptz,?::uuid)) order by created_at"
                        + " desc,id desc limit ?",
                VIEWS,
                space,
                release,
                release,
                at,
                at,
                after == null ? null : after.id(),
                limit + 1);
        var window = PageWindow.of(rows, limit, row -> KeysetCursor.encode(row.createdAt(), row.id()));
        return new Page(window.items(), window.nextCursor());
    }

    @Override
    public List<Pending> pending(int limit) {
        return jdbc.query(
                "select * from shared.pending_bundle_exports(?)",
                (r, n) -> new Pending(r.getObject(1, UUID.class), r.getObject(2, UUID.class)),
                limit);
    }

    @Override
    public Optional<Lease> claim(UUID id) {
        expire();
        jdbc.update(
                "update shared.bundle_exports set"
                        + " status='failed',error='attempts_exhausted',token=null,lease_until=null"
                        + " where id=? and status='running' and lease_until<=now() and attempts>=8",
                id);
        UUID token = UUID.randomUUID();
        return jdbc
                .query(
                        """
update shared.bundle_exports set status='running',token=?,lease_until=now()+interval '2 minutes',attempts=attempts+1
where id=? and expires_at>now() and attempts<8 and ((status in ('queued','retrying') and next_run_at<=now()) or (status='running' and lease_until<=now()))
returning id,tenant_id,attempts,snapshot::text,expires_at
""",
                        (r, n) -> new Lease(
                                r.getObject(1, UUID.class),
                                r.getObject(2, UUID.class),
                                token,
                                r.getInt(3),
                                json.readValue(r.getString(4), ExportSnapshot.class),
                                r.getTimestamp(5).toInstant()),
                        token,
                        id)
                .stream()
                .findFirst();
    }

    @Override
    public boolean heartbeat(Lease lease) {
        return jdbc.update(
                        "update shared.bundle_exports set lease_until=now()+interval '2 minutes'"
                                + " where id=? and token=? and status='running' and lease_until>now()"
                                + " and expires_at>now()",
                        lease.id(),
                        lease.token())
                == 1;
    }

    @Override
    public void complete(Lease lease, String output, long bytes) {
        jdbc.update(
                "update shared.bundle_exports set"
                        + " status='completed',output_key=?,output_bytes=?,error=null,token=null,lease_until=null"
                        + " where id=? and token=? and status='running' and lease_until>now() and"
                        + " expires_at>now()",
                output,
                bytes,
                lease.id(),
                lease.token());
    }

    @Override
    public void fail(Lease lease, String error, boolean retry) {
        jdbc.update(
                "update shared.bundle_exports set status=case when ? and attempts<8 then 'retrying'"
                        + " else 'failed'"
                        + " end,error=?,next_run_at=now()+(least(60,power(2,least(attempts,6)))+random())*interval"
                        + " '1 second',token=null,lease_until=null where id=? and token=? and"
                        + " status='running'",
                retry,
                error,
                lease.id(),
                lease.token());
    }

    @Override
    public boolean retry(UUID space, UUID id) {
        return jdbc.update(
                        "update shared.bundle_exports set"
                                + " status='queued',attempts=0,next_run_at=now(),error=null where"
                                + " space_id=? and id=? and status='failed' and expires_at>now()",
                        space,
                        id)
                == 1;
    }

    @Override
    public void outputMissing(UUID space, UUID id, String expectedKey) {
        jdbc.update(
                "update shared.bundle_exports set"
                        + " status='failed',error='export_output_missing',output_key=null,output_bytes=null"
                        + " where space_id=? and id=? and status='completed' and output_key=?",
                space,
                id,
                expectedKey);
    }

    @Override
    public boolean referencesObject(String key) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "select exists(select 1 from shared.bundle_exports where expires_at>now()"
                        + " and status not in ('expired','cancelled') and (?=any(object_keys)"
                        + " or output_key=?))",
                Boolean.class,
                key,
                key));
    }

    @Override
    public void terminateSpace(UUID space) {
        jdbc.update(
                "update shared.bundle_exports set"
                        + " status='cancelled',snapshot=null,page_ids='{}',object_keys='{}',output_key=null,token=null,lease_until=null"
                        + " where space_id=?",
                space);
    }

    @Override
    public void expire() {
        jdbc.update("update shared.bundle_exports set"
                + " status='expired',snapshot=null,page_ids='{}',object_keys='{}',output_key=null,token=null,lease_until=null"
                + " where expires_at<=now() and status not in ('expired','cancelled')");
    }

    private static final RowMapper<View> VIEWS = (r, n) -> new View(
            r.getObject("id", UUID.class),
            r.getObject("space_id", UUID.class),
            r.getObject("release_id", UUID.class),
            r.getString("visible_status"),
            r.getInt("attempts"),
            r.getString("error"),
            r.getString("trace_id"),
            r.getTimestamp("created_at").toInstant(),
            r.getTimestamp("expires_at").toInstant(),
            r.getObject("output_bytes", Long.class));
}
