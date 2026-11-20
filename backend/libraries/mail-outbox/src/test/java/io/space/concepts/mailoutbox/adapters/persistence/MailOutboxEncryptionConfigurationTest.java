package io.space.concepts.mailoutbox.adapters.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.mailoutbox.api.*;
import org.junit.jupiter.api.Test;

class MailOutboxEncryptionConfigurationTest {
    @Test
    void missingKeyRefusesStartupUnlessEphemeralUseIsExplicit() {
        assertThatThrownBy(() -> new MailOutboxEncryptionConfiguration().mailOutboxCipher("", false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("mail outbox encryption key is required");
    }

    @Test
    void configuredKeySurvivesNewInstancesAndEnvelopeIdentityCannotBeSwapped() {
        var encoded = java.util.Base64.getEncoder().encodeToString(new byte[32]);
        var first = new MailOutboxEncryptionConfiguration().mailOutboxCipher(encoded, false);
        var restarted = new MailOutboxEncryptionConfiguration().mailOutboxCipher(encoded, false);
        var id = new io.space.concepts.mailoutbox.api.MailOutboxApi.MessageId(java.util.UUID.randomUUID());
        var kind = io.space.concepts.mailoutbox.api.MailOutboxApi.Kind.VERIFICATION;
        var encrypted = first.encrypt(id, kind, "reader@example.invalid", "original-payload");
        assertThat(restarted.decrypt(
                        new MailOutboxCipher.Envelope(id.value(), kind.value(), "reader@example.invalid", encrypted)))
                .isEqualTo("original-payload");
        assertThatThrownBy(() -> restarted.decrypt(new MailOutboxCipher.Envelope(
                        java.util.UUID.randomUUID(), kind.value(), "reader@example.invalid", encrypted)))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> restarted.decrypt(
                        new MailOutboxCipher.Envelope(id.value(), kind.value(), "other@example.invalid", encrypted)))
                .isInstanceOf(IllegalStateException.class);
    }
}
