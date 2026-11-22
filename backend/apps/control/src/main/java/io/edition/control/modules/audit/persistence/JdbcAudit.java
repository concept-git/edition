package io.edition.control.modules.audit.persistence;

import io.edition.control.modules.audit.api.*;
import io.edition.control.modules.audit.api.AuditApi;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.*;

@Repository
public class JdbcAudit implements AuditApi {
    private final JdbcTemplate jdbc;

    public JdbcAudit(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public long append(Event e) {
        return append(e, false);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public long appendPlatform(Event e) {
        if (e.tenantId() != null) throw new IllegalArgumentException("platform audit cannot name a tenant");
        return append(e, true);
    }

    private long append(Event e, boolean platform) {
        return jdbc.queryForObject(
                "select shared.append_audit(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                Long.class,
                e.eventId(),
                e.rootId(),
                e.kind(),
                e.actorType(),
                e.actorId(),
                e.action(),
                e.targetType(),
                e.targetId(),
                e.outcome(),
                e.ip(),
                e.requestId(),
                null,
                e.tenantId(),
                platform,
                io.edition.requestcontext.CredentialAuditContext.current());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void failed(Event e) {
        jdbc.queryForObject("select set_config('lock_timeout','1s',true)", String.class);
        append(e);
    }

    public List<Entry> query(Filter f, int limit) {
        var sql = new StringBuilder(
                f.platform()
                        ? "select * from shared.platform_audit() where true"
                        : "select * from shared.audit_log where true");
        var args = new ArrayList<Object>();
        where(f, sql, args, true);
        sql.append(" order by id desc limit ?");
        args.add(limit);
        return jdbc.query(
                sql.toString(),
                (r, n) -> new Entry(
                        r.getLong("id"),
                        r.getObject("event_id", UUID.class),
                        r.getObject("root_id", UUID.class),
                        r.getTimestamp("occurred_at").toInstant(),
                        r.getString("kind"),
                        r.getString("actor_type"),
                        r.getObject("actor_id", UUID.class),
                        r.getString("action"),
                        r.getString("target_type"),
                        r.getObject("target_id", UUID.class),
                        r.getString("outcome"),
                        r.getString("ip"),
                        r.getString("request_id"),
                        r.getObject("credential_id", UUID.class)),
                args.toArray());
    }

    public long count(Filter f) {
        var sql = new StringBuilder(
                f.platform()
                        ? "select count(*) from shared.platform_audit() where true"
                        : "select count(*) from shared.audit_log where true");
        var args = new ArrayList<Object>();
        where(f, sql, args, false);
        return jdbc.queryForObject(sql.toString(), Long.class, args.toArray());
    }

    private static void where(Filter f, StringBuilder sql, List<Object> args, boolean cursor) {
        if (f.actor() != null) {
            sql.append(" and actor_id=?");
            args.add(f.actor());
        }
        if (f.action() != null) {
            sql.append(" and action=?");
            args.add(f.action());
        }
        if (f.target() != null) {
            sql.append(" and target_id=?");
            args.add(f.target());
        }
        if (f.outcome() != null) {
            sql.append(" and outcome=?");
            args.add(f.outcome());
        }
        if (f.from() != null) {
            sql.append(" and occurred_at>=?");
            args.add(Timestamp.from(f.from()));
        }
        if (f.to() != null) {
            sql.append(" and occurred_at<?");
            args.add(Timestamp.from(f.to()));
        }
        if (cursor && f.before() != null) {
            sql.append(" and id<?");
            args.add(f.before());
        }
    }

    public void scrub(UUID actor) {
        jdbc.queryForObject("select shared.scrub_audit_actor(?)", Object.class, actor);
    }

    public void retain(Instant cutoff) {
        jdbc.queryForObject("select shared.retain_audit(?)", Object.class, Timestamp.from(cutoff));
    }
}
