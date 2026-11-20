package io.space.concepts.mailoutbox;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.mailoutbox.api.*;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@org.springframework.context.annotation.Import(io.space.concepts.mailoutbox.adapters.MailOutboxConfiguration.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class MailOutboxModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    MailOutboxApi outbox;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    MailDeliveryApi delivery;

    @Test
    @Transactional
    void persistsAnEncryptedIntentWithoutPlaintextCredentials() {
        String token = "one-time-secret-must-not-be-stored";
        var id = outbox.enqueue(
                MailOutboxApi.Kind.VERIFICATION,
                "recipient@example.invalid",
                Map.of("userId", "00000000-0000-0000-0000-000000000001", "token", token));

        String envelope = jdbc.queryForObject(
                "select encrypted_payload from shared.mail_outbox where id = ?", String.class, id.value());

        assertThat(envelope).startsWith("v1:").doesNotContain(token);
        assertThat(jdbc.queryForObject("select state from shared.mail_outbox where id = ?", String.class, id.value()))
                .isEqualTo("queued");
    }

    @Test
    @Transactional
    void expiredLeaseCanRecoverAndOldAcknowledgementCannotCompleteNewAttempt() {
        var id = outbox.enqueue(MailOutboxApi.Kind.VERIFICATION, "lease@example.invalid", Map.of("token", "original"));
        var first = delivery.claim().orElseThrow();
        assertThat(first.id()).isEqualTo(id.value());
        assertThat(delivery.payload(first)).containsEntry("token", "original");
        assertThat(delivery.claim()).isEmpty();
        jdbc.update("update shared.mail_outbox set lease_until=now()-interval '1 second' where id=?", id.value());
        var second = delivery.claim().orElseThrow();
        assertThat(second.token()).isNotEqualTo(first.token());
        delivery.accepted(first);
        assertThat(delivery.view(id.value()).orElseThrow().status()).isEqualTo("running");
        delivery.accepted(second);
        assertThat(delivery.view(id.value()).orElseThrow()).satisfies(view -> {
            assertThat(view.status()).isEqualTo("completed");
            assertThat(view.outcome()).isEqualTo("accepted");
            assertThat(view.attempt()).isEqualTo(2);
            assertThat(view.recipient()).isEqualTo("l***@example.invalid");
        });
    }

    @Test
    @Transactional
    void transientFailuresExhaustAndReplayKeepsOriginalIdentityAndTotalAttempts() {
        var id = outbox.enqueue(
                MailOutboxApi.Kind.PASSWORD_RESET, "retry@example.invalid", Map.of("token", "unchanged"));
        for (int attempt = 1; attempt <= 8; attempt++) {
            var lease = delivery.claim().orElseThrow();
            delivery.failed(lease, "dependency_unavailable", true);
            assertThat(delivery.view(id.value()).orElseThrow().status()).isEqualTo(attempt < 8 ? "retrying" : "failed");
            jdbc.update("update shared.mail_outbox set next_run_at=now()-interval '1 second' where id=?", id.value());
        }
        assertThat(delivery.retry(id.value())).isTrue();
        var resumed = delivery.claim().orElseThrow();
        assertThat(resumed.id()).isEqualTo(id.value());
        assertThat(delivery.payload(resumed)).containsEntry("token", "unchanged");
        delivery.accepted(resumed);
        assertThat(delivery.view(id.value()).orElseThrow().attempt()).isEqualTo(9);
    }

    @Test
    @Transactional
    void erasureScrubsPayloadAndFencesInFlightAcknowledgements() {
        var id = outbox.enqueue(MailOutboxApi.Kind.INVITATION, "erase@example.invalid", Map.of("token", "private"));
        var lease = delivery.claim().orElseThrow();
        delivery.eraseRecipient("erase@example.invalid");
        delivery.failed(lease, "dependency_unavailable", true);
        delivery.accepted(lease);
        assertThat(delivery.view(id.value()).orElseThrow().outcome()).isEqualTo("erased");
        assertThat(jdbc.queryForObject(
                        "select encrypted_payload from shared.mail_outbox where id=?", String.class, id.value()))
                .isEmpty();
        assertThat(delivery.retry(id.value())).isFalse();
    }

    @Test
    @Transactional
    void leaseRecoveryCannotExceedTheAutomaticAttemptBudget() {
        var id = outbox.enqueue(MailOutboxApi.Kind.VERIFICATION, "budget@example.invalid", Map.of("token", "original"));
        for (int attempt = 1; attempt <= 8; attempt++) {
            assertThat(delivery.claim().orElseThrow().attempt()).isEqualTo(attempt);
            jdbc.update("update shared.mail_outbox set lease_until=now()-interval '1 second' where id=?", id.value());
        }
        assertThat(delivery.claim()).isEmpty();
        assertThat(delivery.view(id.value()).orElseThrow().status()).isEqualTo("failed");
        assertThat(delivery.retry(id.value())).isTrue();
        assertThat(delivery.claim()).isPresent();
    }
}
