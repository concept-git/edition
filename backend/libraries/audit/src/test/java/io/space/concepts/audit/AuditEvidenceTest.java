package io.space.concepts.audit;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.audit.api.*;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@SpringBootTest
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@org.springframework.context.annotation.Import(io.space.concepts.audit.adapters.AuditConfiguration.class)
class AuditEvidenceTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    AuditApi audit;

    @Autowired
    AuditExportsApi exports;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    PlatformTransactionManager manager;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate owner;

    @Test
    void factsRequireAnExistingBusinessTransaction() {
        assertThatThrownBy(() -> audit.append(event(UUID.randomUUID(), UUID.randomUUID(), "fact")))
                .isInstanceOf(org.springframework.transaction.IllegalTransactionStateException.class);
    }

    @Test
    void rolledBackFactsDisappearButIndependentFailureAttemptsRemainIsolated() {
        UUID tenant = UUID.randomUUID(), actor = UUID.randomUUID(), failedActor = UUID.randomUUID();
        var fact = event(tenant, actor, "fact");
        assertThatThrownBy(() -> new TransactionTemplate(manager).executeWithoutResult(tx -> {
                    audit.append(fact);
                    audit.failed(event(tenant, failedActor, "attempt"));
                    throw new IllegalStateException("injected rollback");
                }))
                .isInstanceOf(IllegalStateException.class);
        var rows = scope.inTenant(tenant, () -> audit.query(filter(failedActor), 100));
        assertThat(scope.inTenant(tenant, () -> audit.query(filter(actor), 100)))
                .isEmpty();
        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().kind()).isEqualTo("attempt");
        assertThat(scope.inTenant(UUID.randomUUID(), () -> audit.query(filter(failedActor), 100)))
                .isEmpty();
    }

    @Test
    void erasureScrubsHistoryAndLateFactsAndInvalidatesAnInFlightExportAtomically() {
        UUID tenant = UUID.randomUUID(), actor = UUID.randomUUID();
        var tx = new TransactionTemplate(manager);
        var export = tx.execute(status -> scope.inTenant(tenant, () -> {
            long id = audit.append(event(tenant, actor, "fact"));
            return exports.create(tenant, actor, filter(actor), Instant.now());
        }));
        owner.update(
                "update shared.audit_log set"
                        + " change_summary='{\"email\":\"private@example.org\"}'::jsonb where"
                        + " actor_id=?",
                actor);
        var claim = exports.claim().stream()
                .filter(e -> e.id().equals(export.id()))
                .findFirst()
                .orElseThrow();
        tx.executeWithoutResult(status -> audit.scrub(actor));
        tx.executeWithoutResult(status -> audit.append(event(tenant, actor, "fact")));
        exports.finish(claim, "must-not-be-downloadable.csv", null);
        var rows = scope.inTenant(tenant, () -> audit.query(filter(actor), 100));
        assertThat(rows).hasSize(2).allSatisfy(row -> {
            assertThat(row.actorId()).isEqualTo(actor);
            assertThat(row.ip()).isNull();
            assertThat(row.requestId()).isEqualTo("trace-preserved");
        });
        assertThat(owner.queryForObject(
                        "select count(*) from shared.audit_log where actor_id=? and" + " change_summary is not null",
                        Long.class,
                        actor))
                .isZero();
        var invalidated = scope.inTenant(tenant, () -> exports.view(export.id()).orElseThrow());
        assertThat(invalidated.status()).isEqualTo("failed");
        assertThat(invalidated.objectKey()).isNull();
    }

    @Test
    void explicitPlatformFactsDoNotInheritTheCurrentCustomerTenant() {
        UUID tenant = UUID.randomUUID(), actor = UUID.randomUUID();
        var platform = event(null, actor, "fact");
        scope.inTenant(tenant, () -> audit.appendPlatform(platform));
        assertThat(owner.queryForObject(
                        "select tenant_id from shared.audit_log where event_id=?", UUID.class, platform.eventId()))
                .isNull();
        var inherited = event(null, actor, "fact");
        scope.inTenant(tenant, () -> audit.append(inherited));
        assertThat(owner.queryForObject(
                        "select tenant_id from shared.audit_log where event_id=?", UUID.class, inherited.eventId()))
                .isEqualTo(tenant);
    }

    private AuditApi.Event event(UUID tenant, UUID actor, String kind) {
        return new AuditApi.Event(
                tenant,
                UUID.randomUUID(),
                UUID.randomUUID(),
                kind,
                "user",
                actor,
                "Test.action",
                "site",
                UUID.randomUUID(),
                kind.equals("fact") ? "ok" : "dependency_unavailable",
                "192.0.2.1",
                "trace-preserved");
    }

    private AuditApi.Filter filter(UUID actor) {
        return new AuditApi.Filter(actor, null, null, null, null, null, null, false);
    }
}
