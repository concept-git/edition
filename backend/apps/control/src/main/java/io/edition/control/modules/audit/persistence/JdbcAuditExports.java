package io.edition.control.modules.audit.persistence;

import io.edition.control.modules.audit.api.*;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;

@Repository
public class JdbcAuditExports implements AuditExportsApi {
    private final JdbcTemplate jdbc;
    private final JsonMapper json;

    public JdbcAuditExports(JdbcTemplate jdbc, JsonMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    public Entry create(UUID tenant, UUID actor, AuditApi.Filter filter, Instant cutoff) {
        UUID id = UUID.randomUUID();
        jdbc.update(
                "insert into shared.audit_exports(id,tenant_id,actor_id,filters,cutoff)" + " values(?,?,?,?::jsonb,?)",
                id,
                tenant,
                actor,
                json.writeValueAsString(filter),
                Timestamp.from(cutoff));
        return view(id).orElseThrow();
    }

    public Optional<Entry> view(UUID id) {
        return jdbc.query("select * from shared.audit_exports where id=?", this::row, id).stream()
                .findFirst();
    }

    public List<Entry> claim() {
        return jdbc.query("select * from shared.claim_audit_exports()", this::row);
    }

    public boolean renew(Entry e) {
        return Boolean.TRUE.equals(
                jdbc.queryForObject("select shared.renew_audit_export(?,?)", Boolean.class, e.id(), e.token()));
    }

    public void finish(Entry e, String key, String error) {
        jdbc.queryForObject("select shared.finish_audit_export(?,?,?,?)", Object.class, e.id(), e.token(), key, error);
    }

    private Entry row(java.sql.ResultSet r, int n) throws java.sql.SQLException {
        return new Entry(
                r.getObject("id", UUID.class),
                r.getObject("tenant_id", UUID.class),
                r.getObject("actor_id", UUID.class),
                json.readValue(r.getString("filters"), AuditApi.Filter.class),
                r.getTimestamp("cutoff").toInstant(),
                r.getString("status"),
                r.getString("object_key"),
                r.getString("error"),
                r.getObject("lease_token", UUID.class),
                r.getTimestamp("expires_at").toInstant());
    }
}
