package io.edition.concepts.mailoutbox.adapters.persistence;

import io.edition.concepts.mailoutbox.api.*;
import io.edition.concepts.mailoutbox.api.MailDeliveryApi;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

@Repository
class JdbcMailDelivery implements MailDeliveryApi {
    private static final String REPLAYABLE =
            "state='failed' and encrypted_payload<>'' and last_error_code not in ('payload_unreadable','unexpected')";
    private static final String PROJECTION = "select *, (" + REPLAYABLE + ") as can_retry from shared.mail_outbox ";
    private final JdbcTemplate jdbc;
    private final MailOutboxCipher cipher;
    private final JsonMapper json;
    private final Clock clock;

    JdbcMailDelivery(JdbcTemplate jdbc, MailOutboxCipher cipher, JsonMapper json, Clock clock) {
        this.jdbc = jdbc;
        this.cipher = cipher;
        this.json = json;
        this.clock = clock;
    }

    @Override
    @Transactional
    public Optional<Lease> claim() {
        jdbc.update("""
                update shared.mail_outbox set state='failed', last_error_code='attempts_exhausted',
                    lease_token=null, lease_until=null
                where id in (select id from shared.mail_outbox
                    where state='running' and lease_until<=now() and cycle_attempts>=8
                    order by lease_until for update skip locked limit 100)
                """);
        UUID lease = UUID.randomUUID();
        return jdbc
                .query(
                        """
                with candidate as (
                  select id from shared.mail_outbox
                  where ((state in ('queued','retrying') and next_run_at <= now())
                    or (state='running' and lease_until <= now())) and cycle_attempts < 8
                  order by next_run_at, created_at for update skip locked limit 1
                )
                update shared.mail_outbox m set state='running', attempts=attempts+1, cycle_attempts=cycle_attempts+1,
                  lease_token=?, lease_until=now()+interval '2 minutes', trace_id=?
                from candidate c where m.id=c.id
                returning m.id, m.kind, m.recipient, m.encrypted_payload, m.cycle_attempts
                """,
                        (rs, n) -> new Lease(
                                rs.getObject("id", UUID.class),
                                lease,
                                rs.getString("kind"),
                                rs.getString("recipient"),
                                rs.getString("encrypted_payload"),
                                rs.getInt("cycle_attempts")),
                        lease,
                        UUID.randomUUID())
                .stream()
                .findFirst();
    }

    @Override
    public Map<String, String> payload(Lease lease) {
        String plaintext = cipher.decrypt(
                new MailOutboxCipher.Envelope(lease.id(), lease.kind(), lease.recipient(), lease.encryptedPayload()));
        var result = new HashMap<String, String>();
        var object = json.readTree(plaintext);
        if (!object.isObject()) throw new IllegalStateException("mail payload must be an object");
        object.properties().forEach(entry -> {
            if (!entry.getValue().isString()) throw new IllegalStateException("mail payload field must be text");
            result.put(entry.getKey(), entry.getValue().asString());
        });
        return Map.copyOf(result);
    }

    @Override
    public boolean prepare(Lease lease, Map<String, String> payload) {
        var kind = java.util.Arrays.stream(io.edition.concepts.mailoutbox.api.MailOutboxApi.Kind.values())
                .filter(value -> value.value().equals(lease.kind()))
                .findFirst()
                .orElseThrow();
        String encrypted = cipher.encrypt(
                new io.edition.concepts.mailoutbox.api.MailOutboxApi.MessageId(lease.id()),
                kind,
                lease.recipient(),
                json.writeValueAsString(payload));
        return jdbc.update(
                        "update shared.mail_outbox set encrypted_payload=? where id=? and state='running' and lease_token=? and lease_until>now()",
                        encrypted,
                        lease.id(),
                        lease.token())
                == 1;
    }

    @Override
    public void accepted(Lease lease) {
        complete(lease, "accepted");
    }

    @Override
    public void obsolete(Lease lease) {
        complete(lease, "obsolete");
    }

    private void complete(Lease lease, String outcome) {
        jdbc.update(
                "update shared.mail_outbox set state='completed', outcome=?, completed_at=now(), last_error_code=null, lease_token=null, lease_until=null where id=? and state='running' and lease_token=?",
                outcome,
                lease.id(),
                lease.token());
    }

    @Override
    public void failed(Lease lease, String code, boolean retryable) {
        boolean retry = retryable && lease.attempt() < 8;
        long seconds = Math.min(900, 5L << Math.min(lease.attempt() - 1, 8));
        Instant next = clock.instant()
                .plusSeconds(seconds + ThreadLocalRandom.current().nextLong(Math.max(1, seconds / 4)));
        jdbc.update(
                "update shared.mail_outbox set state=?, last_error_code=?, next_run_at=?, lease_token=null, lease_until=null where id=? and state='running' and lease_token=?",
                retry ? "retrying" : "failed",
                code,
                java.sql.Timestamp.from(next),
                lease.id(),
                lease.token());
    }

    @Override
    public List<View> list(UUID tenant, io.edition.shared.KeysetCursor before, int limit) {
        var at = before == null ? null : java.sql.Timestamp.from(before.at());
        return jdbc.query(
                PROJECTION
                        + "where (?::uuid is null or (tenant_id=?::uuid and kind='invitation')) and (?::timestamptz is null or (created_at,id)<(?::timestamptz,?::uuid)) order by created_at desc,id desc limit ?",
                VIEWS,
                tenant,
                tenant,
                at,
                at,
                before == null ? null : before.id(),
                limit);
    }

    @Override
    public Optional<View> view(UUID id) {
        return jdbc.query(PROJECTION + "where id=?", VIEWS, id).stream().findFirst();
    }

    @Override
    public boolean retry(UUID id) {
        return jdbc.update(
                        "update shared.mail_outbox set state='queued', next_run_at=now(), last_error_code=null, cycle_attempts=0 where id=? and "
                                + REPLAYABLE,
                        id)
                == 1;
    }

    @Override
    public void eraseRecipient(String recipient) {
        jdbc.update(
                "update shared.mail_outbox set recipient='', encrypted_payload='', state='completed', outcome='erased', completed_at=now(), lease_token=null, lease_until=null where lower(recipient)=lower(?)",
                recipient);
    }

    private static Instant instant(ResultSet rs, String field) throws SQLException {
        var value = rs.getTimestamp(field);
        return value == null ? null : value.toInstant();
    }

    private static final RowMapper<View> VIEWS = (rs, n) -> {
        String recipient = rs.getString("recipient");
        int at = recipient.indexOf('@');
        String masked = at > 0 ? recipient.substring(0, 1) + "***" + recipient.substring(at) : "";
        return new View(
                rs.getObject("id", UUID.class),
                rs.getString("kind"),
                masked,
                rs.getObject("tenant_id", UUID.class),
                rs.getString("state"),
                rs.getInt("attempts"),
                instant(rs, "next_run_at"),
                rs.getString("last_error_code"),
                rs.getObject("trace_id", UUID.class),
                rs.getString("outcome"),
                instant(rs, "created_at"),
                instant(rs, "completed_at"),
                rs.getBoolean("can_retry"));
    };
}
