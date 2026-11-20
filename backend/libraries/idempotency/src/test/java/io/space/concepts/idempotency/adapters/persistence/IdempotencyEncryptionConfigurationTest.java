package io.space.concepts.idempotency.adapters.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.idempotency.api.*;
import java.security.SecureRandom;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class IdempotencyEncryptionConfigurationTest {

    private final IdempotencyEncryptionConfiguration configuration = new IdempotencyEncryptionConfiguration();

    @Test
    void missingProductionKeyRefusesStartupConfiguration() {
        assertThatThrownBy(() -> configuration.loadKey("", false, new SecureRandom()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("idempotency AES-256 encryption key is required");
    }

    @Test
    void ephemeralKeyRequiresTheExplicitLocalSwitch() {
        assertThat(configuration.loadKey("", true, new SecureRandom()).getEncoded())
                .hasSize(32);
    }

    @Test
    void configuredKeyMustBeBase64EncodedAes256Material() {
        assertThatThrownBy(() -> configuration.loadKey(
                        Base64.getEncoder().encodeToString(new byte[16]), false, new SecureRandom()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("exactly 32 bytes");

        byte[] configured = new byte[32];
        new SecureRandom().nextBytes(configured);
        assertThat(configuration
                        .loadKey(Base64.getEncoder().encodeToString(configured), false, new SecureRandom())
                        .getEncoded())
                .isEqualTo(configured);
    }
}
