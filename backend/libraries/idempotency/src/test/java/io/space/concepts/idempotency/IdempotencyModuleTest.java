package io.space.concepts.idempotency;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.idempotency.api.*;
import io.space.concepts.idempotency.api.IdempotencyApi.Command;
import io.space.concepts.idempotency.api.IdempotencyApi.StoredResponse;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(io.space.concepts.idempotency.adapters.IdempotencyConfiguration.class)
class IdempotencyModuleTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    IdempotencyApi idempotency;

    @Autowired
    io.space.testing.DatabaseScope tenantScope;
    /** 业务写必须与幂等记录同处一条业务连接，才谈得上"一起回滚"。 */
    @Autowired
    JdbcTemplate runtime;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate jdbc;

    @Test
    void rollbackRemovesBothBusinessWriteAndClaimSoTheSameKeyCanRetry() {
        Command command = command("rollback");
        UUID tenant = seededTenant("Idempotency Rollback");
        UUID team = UUID.randomUUID();

        assertThatExceptionOfType(TestFailure.class)
                .isThrownBy(() -> idempotency.execute(command, () -> {
                    businessWrite(tenant, team, "Rollback");
                    throw new TestFailure();
                }));
        assertThat(count("iam.teams", "id", team)).isZero();
        assertThat(recordCount(command)).isZero();

        StoredResponse retried = idempotency.execute(command, () -> {
            businessWrite(tenant, team, "Retried");
            return response("retried");
        });
        assertThat(retried.body()).isEqualTo("retried");
        assertThat(count("iam.teams", "id", team)).isOne();
        assertThat(recordCount(command)).isOne();
    }

    /** 受 RLS 约束的租户内写入：走业务连接并置事务级 app.tenant_id，与生产路径一致。 */
    private void businessWrite(UUID tenant, UUID team, String name) {
        tenantScope.inTenant(tenant, () -> runtime.update("""
                insert into iam.teams (id, tenant_id, name, normalized_name) values (?, ?, ?, ?)
                """, team, tenant, name, name.toLowerCase()));
    }

    private UUID seededTenant(String name) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into shared.tenants (id, name) values (?, ?)", id, name);
        return id;
    }

    @Test
    void expiredKeyCanBeReusedAndCleanupDeletesOnlyExpiredRows() {
        Command reusable = command("expired-reuse");
        AtomicInteger actions = new AtomicInteger();
        assertThat(idempotency
                        .execute(reusable, () -> response("run-" + actions.incrementAndGet()))
                        .body())
                .isEqualTo("run-1");
        assertThat(jdbc.queryForObject(
                        """
                select extract(epoch from (expires_at - created_at))::bigint
                  from shared.idempotency_records
                 where principal_type = ? and principal_id = ? and operation = ? and idempotency_key = ?
                """,
                        Long.class,
                        reusable.principalType(),
                        reusable.principalId(),
                        reusable.operation(),
                        reusable.key()))
                .isEqualTo(86_400L);
        jdbc.update(
                """
                update shared.idempotency_records set expires_at = ?
                 where principal_type = ? and principal_id = ? and operation = ? and idempotency_key = ?
                """,
                Timestamp.from(Instant.EPOCH),
                reusable.principalType(),
                reusable.principalId(),
                reusable.operation(),
                reusable.key());

        assertThat(idempotency
                        .execute(reusable, () -> response("run-" + actions.incrementAndGet()))
                        .body())
                .isEqualTo("run-2");

        Command cleanup = command("cleanup");
        idempotency.execute(cleanup, () -> response("cleanup"));
        jdbc.update(
                """
                update shared.idempotency_records set expires_at = ?
                 where principal_type = ? and principal_id = ? and operation = ? and idempotency_key = ?
                """,
                Timestamp.from(Instant.EPOCH),
                cleanup.principalType(),
                cleanup.principalId(),
                cleanup.operation(),
                cleanup.key());
        assertThat(idempotency.deleteExpired(Instant.now(), 100)).isOne();
        assertThat(recordCount(cleanup)).isZero();
        assertThat(recordCount(reusable)).isOne();
    }

    @Test
    void committedProcessingRecordNeverExecutesASecondActionOrPretendsSuccess() {
        Command command = command("processing");
        Instant now = Instant.now();
        jdbc.update(
                """
                insert into shared.idempotency_records (
                  principal_type, principal_id, operation, idempotency_key,
                  request_fingerprint, state, created_at, expires_at
                ) values (?, ?, ?, ?, ?, 'processing', ?, ?)
                """,
                command.principalType(),
                command.principalId(),
                command.operation(),
                command.key(),
                command.requestFingerprint(),
                Timestamp.from(now),
                Timestamp.from(now.plusSeconds(3_600)));
        AtomicInteger actions = new AtomicInteger();

        assertThatExceptionOfType(IdempotencyRequestInProgressException.class)
                .isThrownBy(() -> idempotency.execute(command, () -> {
                    actions.incrementAndGet();
                    return response("must-not-run");
                }));
        assertThat(actions).hasValue(0);
    }

    @Test
    void completedBodiesAreEncryptedWithFreshNoncesAndReplayExactly() {
        Command firstCommand = command("encrypted-first");
        Command secondCommand = command("encrypted-second");
        String secretBody = "{\"token\":\"one-time-secret\"}";

        StoredResponse first = idempotency.execute(firstCommand, () -> response(secretBody));
        StoredResponse replay = idempotency.execute(firstCommand, () -> {
            throw new AssertionError("replay must not execute the action");
        });
        idempotency.execute(secondCommand, () -> response(secretBody));

        String firstEnvelope = storedBody(firstCommand);
        String secondEnvelope = storedBody(secondCommand);
        assertThat(firstEnvelope).startsWith("v1:").doesNotContain(secretBody).doesNotContain("one-time-secret");
        assertThat(secondEnvelope).startsWith("v1:").isNotEqualTo(firstEnvelope);
        assertThat(replay).isEqualTo(first);
    }

    @Test
    void tamperedEnvelopeOrBoundAadFailsAuthentication() {
        Command envelopeCommand = command("tampered-envelope");
        idempotency.execute(envelopeCommand, () -> response("sensitive-body"));
        jdbc.update(
                """
                update shared.idempotency_records set response_body = ?
                 where principal_type = ? and principal_id = ? and operation = ? and idempotency_key = ?
                """,
                "v1:" + Base64.getEncoder().encodeToString(new byte[40]),
                envelopeCommand.principalType(),
                envelopeCommand.principalId(),
                envelopeCommand.operation(),
                envelopeCommand.key());
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> idempotency.execute(envelopeCommand, () -> response("must-not-run")))
                .withMessageContaining("authentication failed");

        Command aadCommand = command("tampered-aad");
        idempotency.execute(aadCommand, () -> response("another-sensitive-body"));
        jdbc.update(
                """
                update shared.idempotency_records set request_fingerprint = 'moved-fingerprint'
                 where principal_type = ? and principal_id = ? and operation = ? and idempotency_key = ?
                """, aadCommand.principalType(), aadCommand.principalId(), aadCommand.operation(), aadCommand.key());
        Command moved = new Command(
                aadCommand.principalType(),
                aadCommand.principalId(),
                aadCommand.operation(),
                aadCommand.key(),
                "moved-fingerprint");
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> idempotency.execute(moved, () -> response("must-not-run")))
                .withMessageContaining("authentication failed");
    }

    private long recordCount(Command command) {
        return jdbc.queryForObject(
                """
                select count(*) from shared.idempotency_records
                 where principal_type = ? and principal_id = ? and operation = ? and idempotency_key = ?
                """, Long.class, command.principalType(), command.principalId(), command.operation(), command.key());
    }

    private String storedBody(Command command) {
        return jdbc.queryForObject(
                """
                select response_body from shared.idempotency_records
                 where principal_type = ? and principal_id = ? and operation = ? and idempotency_key = ?
                """, String.class, command.principalType(), command.principalId(), command.operation(), command.key());
    }

    private long count(String table, String column, UUID value) {
        return jdbc.queryForObject("select count(*) from " + table + " where " + column + " = ?", Long.class, value);
    }

    private static Command command(String operation) {
        return new Command(
                "user", UUID.randomUUID(), operation, UUID.randomUUID().toString(), "fingerprint");
    }

    private static StoredResponse response(String body) {
        return new StoredResponse(201, body, "application/json");
    }

    private static final class TestFailure extends RuntimeException {}
}
