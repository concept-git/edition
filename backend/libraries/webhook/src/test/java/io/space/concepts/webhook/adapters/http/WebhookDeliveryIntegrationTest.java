package io.space.concepts.webhook.adapters.http;

import static org.assertj.core.api.Assertions.*;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.space.concepts.webhook.api.*;
import io.space.concepts.webhook.api.WebhookApi;
import java.net.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import okhttp3.OkHttpClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@SpringBootTest
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@org.springframework.context.annotation.Import(io.space.concepts.webhook.adapters.WebhookConfiguration.class)
class WebhookDeliveryIntegrationTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    WebhookApi hooks;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate owner;

    @Test
    void realHttpFailuresExhaustEightAttemptsThenReplayTheSameEventAndPauseSkipsNewEvents() throws Exception {
        UUID tenant = UUID.randomUUID();
        owner.update("insert into shared.tenants(id,name) values(?,?)", tenant, "Webhook transport");
        var tenantId = tenant;
        var subscription = scope.inTenant(
                tenantId,
                () -> hooks.create(
                        tenant, "https://receiver.example/hook", "tenant", null, Set.of("release.promoted")));
        UUID eventId = UUID.randomUUID();
        scope.inTenant(
                tenantId,
                () -> hooks.capture(
                        tenant,
                        new WebhookApi.Event(
                                eventId,
                                "release.promoted",
                                Instant.now(),
                                UUID.randomUUID(),
                                null,
                                null,
                                "promoted",
                                "trace")));
        var statuses = new AtomicInteger(429);
        var received = new java.util.concurrent.CopyOnWriteArrayList<String>();
        var receiver =
                com.sun.net.httpserver.HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        receiver.createContext("/hook", exchange -> {
            var body = new String(exchange.getRequestBody().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            received.add(body);
            String id = exchange.getRequestHeaders().getFirst("webhook-id");
            String timestamp = exchange.getRequestHeaders().getFirst("webhook-timestamp");
            assertThat(id).isEqualTo(eventId.toString());
            assertThat(exchange.getRequestHeaders().getFirst("webhook-signature"))
                    .isEqualTo(SignedWebhookWorker.signature(subscription.secret(), id, timestamp, body));
            exchange.sendResponseHeaders(statuses.get(), -1);
            exchange.close();
        });
        receiver.start();
        try {
            var worker =
                    new SignedWebhookWorker(hooks, Clock.systemUTC(), new SimpleMeterRegistry(), new OkHttpClient());
            UUID delivery = null;
            for (int attempt = 1; attempt <= 8; attempt++) {
                var claim = hooks.claim(1).getFirst();
                delivery = claim.id();
                worker.send(local(claim, receiver.getAddress().getPort()));
                String status = owner.queryForObject(
                        "select status from shared.webhook_deliveries where id=?", String.class, delivery);
                assertThat(status).isEqualTo(attempt == 8 ? "failed" : "retrying");
                assertThat(hooks.claim(1)).isEmpty();
                owner.update(
                        "update shared.webhook_deliveries set next_retry_at=now()-interval '1" + " second' where id=?",
                        delivery);
                statuses.set(503);
            }
            var terminalId = delivery;
            assertThat(scope.inTenant(
                            tenantId,
                            () -> hooks.redeliver(subscription.subscription().id(), terminalId)))
                    .isTrue();
            statuses.set(204);
            var replay = hooks.claim(1).getFirst();
            worker.send(local(replay, receiver.getAddress().getPort()));
            assertThat(replay.eventId()).isEqualTo(eventId);
            assertThat(owner.queryForObject(
                            "select status from shared.webhook_deliveries where id=?", String.class, delivery))
                    .isEqualTo("completed");
            assertThat(received).hasSize(9);
            assertThat(new HashSet<>(received)).hasSize(1);
            assertThat(subscription.secret()).startsWith(SignedWebhookWorker.SECRET_PREFIX);
            assertThat(java.util.Base64.getDecoder()
                            .decode(subscription.secret().substring(SignedWebhookWorker.SECRET_PREFIX.length())))
                    .hasSize(32);
            var payload =
                    tools.jackson.databind.json.JsonMapper.builder().build().readTree(received.getFirst());
            assertThat(payload.propertyNames()).containsExactlyInAnyOrder("type", "timestamp", "data");
            assertThat(payload.get("type").asString()).isEqualTo("release.promoted");
            assertThat(Instant.parse(payload.get("timestamp").asString())).isNotNull();
            assertThat(payload.get("data").propertyNames())
                    .containsExactlyInAnyOrder("resourceId", "spaceId", "siteId", "outcome", "requestId");
            assertThat(payload.get("data").get("requestId").asString()).isEqualTo("trace");
            scope.inTenant(tenantId, () -> {
                hooks.update(
                        subscription.subscription().id(),
                        "https://receiver.example/hook",
                        "tenant",
                        null,
                        Set.of("release.promoted"),
                        false);
                hooks.capture(
                        tenant,
                        new WebhookApi.Event(
                                UUID.randomUUID(),
                                "release.promoted",
                                Instant.now(),
                                UUID.randomUUID(),
                                null,
                                null,
                                "promoted",
                                "paused"));
                hooks.update(
                        subscription.subscription().id(),
                        "https://receiver.example/hook",
                        "tenant",
                        null,
                        Set.of("release.promoted"),
                        true);
            });
            assertThat(hooks.claim(1)).isEmpty();
        } finally {
            receiver.stop(0);
        }
    }

    private WebhookApi.Claim local(WebhookApi.Claim c, int port) {
        return new WebhookApi.Claim(
                c.id(),
                c.webhookId(),
                c.eventId(),
                c.token(),
                "http://localhost:" + port + "/hook",
                c.encryptedSecret(),
                c.payload(),
                c.attempt());
    }

    @Test
    void expiredLeasesConsumeTheSameEightAttemptBudget() {
        UUID tenant = UUID.randomUUID();
        owner.update("insert into shared.tenants(id,name) values(?,?)", tenant, "Lost webhook leases");
        var tenantId = tenant;
        scope.inTenant(tenantId, () -> {
            hooks.create(tenant, "https://receiver.example/hook", "tenant", null, Set.of("release.promoted"));
            hooks.capture(
                    tenant,
                    new WebhookApi.Event(
                            UUID.randomUUID(),
                            "release.promoted",
                            Instant.now(),
                            UUID.randomUUID(),
                            null,
                            null,
                            "promoted",
                            "lease-test"));
        });
        WebhookApi.Claim last = null;
        for (int attempt = 1; attempt <= 8; attempt++) {
            last = hooks.claim(1).getFirst();
            assertThat(last.attempt()).isEqualTo(attempt);
            owner.update(
                    "update shared.webhook_deliveries set lease_until=now()-interval '1 second' where id=?", last.id());
        }
        assertThat(hooks.claim(1)).isEmpty();
        assertThat(owner.queryForObject(
                        "select status from shared.webhook_deliveries where id=?", String.class, last.id()))
                .isEqualTo("failed");
        hooks.finish(last, 204, null, 1);
        assertThat(owner.queryForObject(
                        "select status from shared.webhook_deliveries where id=?", String.class, last.id()))
                .isEqualTo("failed");
    }
}
