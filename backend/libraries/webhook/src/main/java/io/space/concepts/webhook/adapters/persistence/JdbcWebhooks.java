package io.space.concepts.webhook.adapters.persistence;

import io.space.concepts.webhook.api.*;
import io.space.concepts.webhook.api.WebhookApi;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;

@Repository
public class JdbcWebhooks implements WebhookApi {
    private final JdbcTemplate jdbc;
    private final JsonMapper json;
    private final WebhookCipher cipher;

    public JdbcWebhooks(JdbcTemplate jdbc, JsonMapper json, WebhookCipher cipher) {
        this.jdbc = jdbc;
        this.json = json;
        this.cipher = cipher;
    }

    public Created create(UUID tenant, String url, String scopeType, UUID scopeId, Set<String> events) {
        validate(url, scopeType, scopeId, events);
        String secret = cipher.generate();
        UUID id = UUID.randomUUID();
        jdbc.update(
                "insert into shared.webhooks(id,tenant_id,url,scope_type,scope_id,events,secret)"
                        + " values(?,?,?,?,?,string_to_array(?,','),?)",
                id,
                tenant,
                url,
                scopeType,
                scopeId,
                String.join(",", events),
                cipher.encrypt(secret));
        return new Created(view(id).orElseThrow(), secret);
    }

    public Optional<Subscription> view(UUID id) {
        return jdbc.query("select * from shared.webhooks where id=?", this::subscription, id).stream()
                .findFirst();
    }

    public List<Subscription> list(UUID before, int limit) {
        return jdbc.query(
                "select * from shared.webhooks where (?::uuid is null or id<?) order by id desc" + " limit ?",
                this::subscription,
                before,
                before,
                limit);
    }

    public void update(UUID id, String url, String scopeType, UUID scopeId, Set<String> events, boolean active) {
        validate(url, scopeType, scopeId, events);
        jdbc.update(
                "update shared.webhooks set"
                        + " url=?,scope_type=?,scope_id=?,events=string_to_array(?,','),active=? where"
                        + " id=?",
                url,
                scopeType,
                scopeId,
                String.join(",", events),
                active,
                id);
    }

    public String rotate(UUID id) {
        String secret = cipher.generate();
        jdbc.update("update shared.webhooks set secret=? where id=?", cipher.encrypt(secret), id);
        return secret;
    }

    public void capture(UUID tenant, Event event) {
        if (!EVENTS.contains(event.type())) throw new IllegalArgumentException("unknown event");
        jdbc.update(
                """
                insert into shared.webhook_deliveries(webhook_id,event_id,event_type,payload)
                select id,?,?,?::jsonb from shared.webhooks where tenant_id=? and active and ?=any(events)
                  and (scope_type='tenant' or (scope_type='space' and scope_id=?) or (scope_type='site' and scope_id=?))
                on conflict(webhook_id,event_id) do nothing
                """,
                event.id(),
                event.type(),
                json.writeValueAsString(Payload.of(event)),
                tenant,
                event.type(),
                event.spaceId(),
                event.siteId());
    }

    public List<Delivery> deliveries(UUID webhook, UUID before, int limit) {
        return jdbc.query(
                "select * from shared.webhook_deliveries where webhook_id=? and (?::uuid is null or"
                        + " id<?) order by id desc limit ?",
                (r, n) -> new Delivery(
                        r.getObject("id", UUID.class),
                        r.getObject("event_id", UUID.class),
                        r.getString("event_type"),
                        r.getString("status"),
                        r.getInt("attempts"),
                        r.getTimestamp("next_retry_at") == null
                                ? null
                                : r.getTimestamp("next_retry_at").toInstant(),
                        r.getObject("response_code", Integer.class),
                        r.getTimestamp("created_at").toInstant()),
                webhook,
                before,
                before,
                limit);
    }

    public List<Attempt> attempts(UUID delivery) {
        return jdbc.query(
                "select * from shared.webhook_attempts where delivery_id=? order by started_at,id",
                (r, n) -> new Attempt(
                        r.getObject("id", UUID.class),
                        r.getTimestamp("started_at").toInstant(),
                        r.getObject("response_code", Integer.class),
                        r.getString("error"),
                        r.getObject("duration_ms", Long.class)),
                delivery);
    }

    public boolean redeliver(UUID webhook, UUID delivery) {
        return jdbc.update("""
                        update shared.webhook_deliveries set status='queued',auto_attempts=0,next_retry_at=now(),lease_token=null,lease_until=null
                        where id=? and webhook_id=? and status in ('completed','failed') and exists(select 1 from shared.webhooks where id=? and active)
                        """, delivery, webhook, webhook) > 0;
    }

    public List<Claim> claim(int limit) {
        return jdbc.query(
                "select * from shared.claim_webhooks(?)",
                (r, n) -> new Claim(
                        r.getObject("id", UUID.class),
                        r.getObject("webhook_id", UUID.class),
                        r.getObject("event_id", UUID.class),
                        r.getObject("lease_token", UUID.class),
                        r.getString("url"),
                        r.getString("secret"),
                        r.getString("payload"),
                        r.getInt("auto_attempts")),
                limit);
    }

    public void finish(Claim c, Integer status, String error, long duration) {
        jdbc.queryForObject(
                "select shared.finish_webhook(?,?,?,?,?)", Object.class, c.id(), c.token(), status, error, duration);
    }

    public String secret(String encrypted) {
        return cipher.decrypt(encrypted);
    }

    private Subscription subscription(java.sql.ResultSet r, int n) throws java.sql.SQLException {
        return new Subscription(
                r.getObject("id", UUID.class),
                r.getObject("tenant_id", UUID.class),
                r.getString("url"),
                r.getString("scope_type"),
                r.getObject("scope_id", UUID.class),
                Set.of((String[]) r.getArray("events").getArray()),
                r.getBoolean("active"),
                r.getTimestamp("created_at").toInstant());
    }

    record Payload(String type, java.time.Instant timestamp, Data data) {
        static Payload of(Event e) {
            return new Payload(
                    e.type(), e.time(), new Data(e.resourceId(), e.spaceId(), e.siteId(), e.outcome(), e.requestId()));
        }
    }

    record Data(UUID resourceId, UUID spaceId, UUID siteId, String outcome, String requestId) {}

    private static void validate(String value, String scope, UUID id, Set<String> events) {
        if (!WebhookApi.validConfiguration(value, scope, id, events))
            throw new IllegalArgumentException("invalid webhook configuration");
    }
}
