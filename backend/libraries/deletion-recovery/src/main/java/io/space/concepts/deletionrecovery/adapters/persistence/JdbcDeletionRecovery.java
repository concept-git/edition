package io.space.concepts.deletionrecovery.adapters.persistence;

import io.space.concepts.deletionrecovery.api.*;
import io.space.concepts.deletionrecovery.api.DeletionRecoveryApi;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

@Repository
public class JdbcDeletionRecovery implements DeletionRecoveryApi {
    private final JdbcTemplate jdbc;
    private final JsonMapper json;

    public JdbcDeletionRecovery(JdbcTemplate jdbc, JsonMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    public void boundLockWait() {
        jdbc.queryForObject("select set_config('lock_timeout','5s',true)", String.class);
    }

    public void lockSpace(UUID space) {
        jdbc.queryForObject("select set_config('lock_timeout','5s',true)", String.class);
        try {
            jdbc.queryForObject("select pg_advisory_xact_lock(hashtext('import:' || ?::text))", Object.class, space);
        } catch (org.springframework.jdbc.UncategorizedSQLException failure) {
            if ("55P03".equals(failure.getSQLException().getSQLState()))
                throw new org.springframework.dao.CannotAcquireLockException("space lock wait exceeded", failure);
            throw failure;
        }
    }

    public Deletion deleted(UUID tenant, String type, UUID target, UUID actor, Set<String> objects, Set<UUID> sites) {
        jdbc.update("""
                insert into shared.deletion_records(tenant_id,resource_type,resource_id,actor_id,objects,sites)
                values(?,?,?,?,?::jsonb,?::jsonb) on conflict(resource_id) do nothing
                """, tenant, type, target, actor, json.writeValueAsString(objects), json.writeValueAsString(sites));
        return deletion(target).orElseThrow();
    }

    public Optional<Deletion> deletion(UUID target) {
        return jdbc.query("select * from shared.deletion_records where resource_id=?", this::row, target).stream()
                .findFirst();
    }

    public List<Deletion> deletions(UUID before, int limit) {
        return jdbc.query(
                "select * from shared.deletion_records where (?::uuid is null or id<?) order by id" + " desc limit ?",
                this::row,
                before,
                before,
                limit);
    }

    public void finish(UUID target, String status, String error) {
        if (!Set.of("queued", "running", "retrying", "failed", "completed").contains(status))
            throw new IllegalArgumentException("invalid operation status");
        jdbc.update(
                "update shared.deletion_records set status=?,error=?,updated_at=now() where"
                        + " resource_id=? and status<>'completed'",
                status,
                error,
                target);
    }

    public void retry(UUID target) {
        jdbc.update(
                "update shared.deletion_records set status='queued',error=null,updated_at=now()"
                        + " where resource_id=? and status in ('failed','retrying')",
                target);
    }

    private Deletion row(java.sql.ResultSet r, int n) throws java.sql.SQLException {
        return new Deletion(
                r.getObject("id", UUID.class),
                r.getObject("tenant_id", UUID.class),
                r.getString("resource_type"),
                r.getObject("resource_id", UUID.class),
                r.getObject("actor_id", UUID.class),
                r.getString("status"),
                r.getString("error"),
                json.readValue(r.getString("objects"), new TypeReference<Set<String>>() {}),
                json.readValue(r.getString("sites"), new TypeReference<Set<UUID>>() {}),
                r.getTimestamp("created_at").toInstant());
    }
}
