package io.edition.concepts.mailoutbox.adapters.persistence;

import io.edition.concepts.mailoutbox.api.*;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class MailOutboxEncryptionConfiguration {
    @Bean
    MailOutboxCipher mailOutboxCipher(
            @Value("${io.edition.mail-outbox.encryption-key:}") String encoded,
            @Value("${io.edition.mail-outbox.allow-ephemeral-key:false}") boolean allowEphemeral) {
        byte[] key;
        if (encoded.isBlank()) {
            if (!allowEphemeral) {
                throw new IllegalStateException(
                        "mail outbox encryption key is required; set MAIL_OUTBOX_ENCRYPTION_KEY");
            }
            key = new byte[32];
            new SecureRandom().nextBytes(key);
        } else {
            try {
                key = Base64.getDecoder().decode(encoded);
            } catch (IllegalArgumentException invalid) {
                throw new IllegalStateException("mail outbox encryption key must be base64", invalid);
            }
            if (key.length != 32) throw new IllegalStateException("mail outbox encryption key must be 32 bytes");
        }
        SecretKey secret = new SecretKeySpec(key, "AES");
        return new MailOutboxCipher(secret, new SecureRandom());
    }
}
