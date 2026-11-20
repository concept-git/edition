package io.space.concepts.session;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.session.api.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@org.springframework.context.annotation.Import(io.space.concepts.session.adapters.SessionConfiguration.class)
class SessionModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    SessionApi sessions;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    // OP: after start then _principal (s) : (p)
    @Test
    void startLetsTheHolderSkipProvingIdentityAgain() {
        var holder = new SessionApi.HolderId(insertUser());
        var started = (SessionApi.StartResult.Started)
                sessions.start(holder, new SessionApi.Device("Laptop", "Firefox", "Linux"), "192.0.2.0/24");

        assertThat(sessions.principal(started.credentials().session())).contains(holder);
    }

    // OP: after end (s, p) then _principal (s) 无绑定
    @Test
    void endUnbindsThePrincipalImmediately() {
        var holder = new SessionApi.HolderId(insertUser());
        var started = (SessionApi.StartResult.Started)
                sessions.start(holder, new SessionApi.Device("Laptop", "Firefox", "Linux"), "192.0.2.0/24");
        var id = started.credentials().session();

        sessions.end(id, holder);

        assertThat(sessions.principal(id)).isEmpty();
    }

    // OP: after endAll (p) then every session of p has no principal
    @Test
    void endAllUnbindsEveryDeviceAtOnce() {
        var holder = new SessionApi.HolderId(insertUser());
        var first = ((SessionApi.StartResult.Started)
                        sessions.start(holder, new SessionApi.Device("First", "Chrome", "macOS"), "192.0.2.0/24"))
                .credentials()
                .session();
        var second = ((SessionApi.StartResult.Started)
                        sessions.start(holder, new SessionApi.Device("Second", "Firefox", "Linux"), "192.0.2.0/24"))
                .credentials()
                .session();

        sessions.endAll(holder);

        assertThat(sessions.principal(first)).isEmpty();
        assertThat(sessions.principal(second)).isEmpty();
    }

    @Test
    void refreshRotatesWithoutExtendingAbsoluteExpiryAndReplayRevokes() {
        var holder = new SessionApi.HolderId(insertUser());
        var started = (SessionApi.StartResult.Started)
                sessions.start(holder, new SessionApi.Device("Laptop", "Firefox", "Linux"), "192.0.2.0/24");
        var original = started.credentials();
        var expiresAt = jdbc.queryForObject(
                "select expires_at from iam.sessions where id = ?",
                java.time.Instant.class,
                original.session().value());

        var renewed = (SessionApi.RenewResult.Renewed) sessions.renew(original.refreshToken());
        assertThat(renewed.credentials().refreshToken()).isNotEqualTo(original.refreshToken());
        assertThat(jdbc.queryForObject(
                        "select expires_at from iam.sessions where id = ?",
                        java.time.Instant.class,
                        original.session().value()))
                .isEqualTo(expiresAt);
        assertThat(sessions.renew(original.refreshToken()))
                .isEqualTo(new SessionApi.RenewResult.Rejected(SessionApi.RenewResult.Reason.CONCURRENT_REUSE));

        fixtures.update(
                "update iam.sessions set rotated_at = now() - interval '11 seconds' where id = ?",
                original.session().value());
        assertThat(sessions.renew(original.refreshToken()))
                .isEqualTo(new SessionApi.RenewResult.Rejected(SessionApi.RenewResult.Reason.REPLAYED));
        assertThat(sessions.principal(original.session())).isEmpty();
    }

    @Test
    void onlyTheHolderCanEndADeviceAndTouchDoesNotExtendExpiry() {
        var holder = new SessionApi.HolderId(insertUser());
        var started = (SessionApi.StartResult.Started)
                sessions.start(holder, new SessionApi.Device("Phone", "Safari", "iOS"), "2001:db8::/48");
        var id = started.credentials().session();
        var expiry = jdbc.queryForObject(
                "select expires_at from iam.sessions where id = ?", java.time.Instant.class, id.value());

        sessions.end(id, new SessionApi.HolderId(UUID.randomUUID()));
        assertThat(sessions.principal(id)).contains(holder);

        // 5 分钟内的 touch 是空操作，超过阈值才落库；无论哪种都不得延长绝对期限
        var freshSeenAt = lastSeenAt(id);
        sessions.touch(id);
        assertThat(lastSeenAt(id)).isEqualTo(freshSeenAt);

        fixtures.update("update iam.sessions set last_seen_at = now() - interval '6 minutes' where id = ?", id.value());
        var staleSeenAt = lastSeenAt(id);
        sessions.touch(id);
        assertThat(lastSeenAt(id)).isAfter(staleSeenAt);
        assertThat(jdbc.queryForObject(
                        "select expires_at from iam.sessions where id = ?", java.time.Instant.class, id.value()))
                .isEqualTo(expiry);

        sessions.end(id, holder);
        assertThat(sessions.principal(id)).isEmpty();
    }

    private java.time.Instant lastSeenAt(SessionApi.SessionId id) {
        return jdbc.queryForObject(
                "select last_seen_at from iam.sessions where id = ?", java.time.Instant.class, id.value());
    }

    @Test
    void sessionListUsesOpaqueLastSeenCursorWithoutDuplicates() {
        var holder = new SessionApi.HolderId(insertUser());
        var first = ((SessionApi.StartResult.Started)
                        sessions.start(holder, new SessionApi.Device("First", "Chrome", "macOS"), "192.0.2.0/24"))
                .credentials()
                .session();
        var second = ((SessionApi.StartResult.Started)
                        sessions.start(holder, new SessionApi.Device("Second", "Firefox", "Linux"), "192.0.2.0/24"))
                .credentials()
                .session();
        var third = ((SessionApi.StartResult.Started)
                        sessions.start(holder, new SessionApi.Device("Third", "Safari", "macOS"), "192.0.2.0/24"))
                .credentials()
                .session();
        fixtures.update(
                "update iam.sessions set last_seen_at = now() - interval '3 minutes' where id = ?", first.value());
        fixtures.update(
                "update iam.sessions set last_seen_at = now() - interval '2 minutes' where id = ?", second.value());
        fixtures.update(
                "update iam.sessions set last_seen_at = now() - interval '1 minute' where id = ?", third.value());

        var pageOne = sessions.listOf(holder, null, 2, third);
        var pageTwo = sessions.listOf(holder, pageOne.nextCursor(), 2, third);

        assertThat(pageOne.sessions())
                .extracting(view -> view.id().value())
                .containsExactly(third.value(), second.value());
        assertThat(pageOne.nextCursor()).isNotBlank();
        assertThat(pageTwo.sessions()).extracting(view -> view.id().value()).containsExactly(first.value());
        assertThat(pageTwo.nextCursor()).isNull();
    }

    @Test
    void sessionCursorPreservesSubMillisecondPrecision() {
        var holder = new SessionApi.HolderId(insertUser());
        var ids = new java.util.ArrayList<SessionApi.SessionId>();
        for (int i = 0; i < 3; i++) {
            var id = ((SessionApi.StartResult.Started)
                            sessions.start(holder, new SessionApi.Device("Device " + i, "Firefox", "Linux"), "unknown"))
                    .credentials()
                    .session();
            ids.add(id);
            fixtures.update(
                    "update iam.sessions set last_seen_at = '2026-01-01T00:00:00.123456Z'::timestamptz where id = ?",
                    id.value());
        }
        var expected = ids.stream()
                .sorted(java.util.Comparator.comparing(
                        id -> id.value().toString(), java.util.Comparator.reverseOrder()))
                .toList();
        var seen = new java.util.ArrayList<SessionApi.SessionId>();
        String cursor = null;
        do {
            var page = sessions.listOf(holder, cursor, 1, ids.getFirst());
            seen.addAll(page.sessions().stream().map(SessionApi.View::id).toList());
            cursor = page.nextCursor();
        } while (cursor != null && seen.size() <= ids.size());
        assertThat(seen).containsExactlyElementsOf(expected);
    }

    private UUID insertUser() {
        return jdbc.queryForObject(
                "insert into iam.users (email, name, verified) values (?, 'Session User', true) returning id",
                UUID.class,
                UUID.randomUUID() + "@session.test");
    }
}
