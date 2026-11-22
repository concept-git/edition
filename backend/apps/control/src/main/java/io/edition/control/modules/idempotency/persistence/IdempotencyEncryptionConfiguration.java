package io.edition.control.modules.idempotency.persistence;

import io.edition.control.modules.idempotency.api.*;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class IdempotencyEncryptionConfiguration {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyEncryptionConfiguration.class);
    private static final int AES_256_KEY_BYTES = 32;

    @Bean
    IdempotencyResponseCipher idempotencyResponseCipher(
            @Value("${io.edition.idempotency.encryption-key:}") String configuredKey,
            @Value("${io.edition.idempotency.allow-ephemeral-key:false}") boolean allowEphemeral) {
        SecureRandom random = new SecureRandom();
        return new IdempotencyResponseCipher(loadKey(configuredKey, allowEphemeral, random), random);
    }

    SecretKey loadKey(String configuredKey, boolean allowEphemeral, SecureRandom random) {
        if (configuredKey.isBlank()) {
            if (!allowEphemeral) {
                throw new IllegalStateException(
                        "idempotency AES-256 encryption key is required; set IDEMPOTENCY_ENCRYPTION_KEY "
                                + "to a base64-encoded 32-byte key, or explicitly opt into an ephemeral key "
                                + "with io.edition.idempotency.allow-ephemeral-key=true for local runs only");
            }
            byte[] ephemeral = new byte[AES_256_KEY_BYTES];
            random.nextBytes(ephemeral);
            log.warn("No idempotency encryption key configured; using an ephemeral AES-256 key. "
                    + "Never enable this in production because stored replays become unreadable after restart.");
            return new SecretKeySpec(ephemeral, "AES");
        }

        final byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(configuredKey);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "idempotency encryption key must be valid base64 encoding exactly 32 bytes", exception);
        }
        if (decoded.length != AES_256_KEY_BYTES) {
            throw new IllegalStateException("idempotency encryption key must decode to exactly 32 bytes for AES-256");
        }
        return new SecretKeySpec(decoded, "AES");
    }
}
