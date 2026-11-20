package io.space.concepts.webhook.adapters.persistence;

import io.space.concepts.webhook.api.*;
import java.security.*;
import java.util.*;
import javax.crypto.*;
import javax.crypto.spec.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
final class WebhookCipher {
    private final byte[] key;
    private static final SecureRandom RANDOM = new SecureRandom();

    WebhookCipher(
            @Value(
                            "${io.space.webhooks.encryption-key:${WEBHOOK_ENCRYPTION_KEY:${io.space.idempotency.encryption-key:}}}")
                    String configured,
            @Value("${io.space.idempotency.allow-ephemeral-key:false}") boolean temporary) {
        byte[] raw;
        if (configured.isBlank()) {
            if (!temporary) throw new IllegalStateException("Webhook encryption key required");
            raw = new byte[32];
            RANDOM.nextBytes(raw);
        } else raw = Base64.getDecoder().decode(configured);
        if (raw.length != 32) throw new IllegalStateException("Webhook key must be 32 bytes");
        try {
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(raw, "HmacSHA256"));
            key = mac.doFinal("space/webhooks/v1".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (GeneralSecurityException impossible) {
            throw new IllegalStateException("Webhook cipher unavailable", impossible);
        }
    }

    String generate() {
        byte[] value = new byte[32];
        RANDOM.nextBytes(value);
        return "whsec_" + Base64.getEncoder().encodeToString(value);
    }

    String encrypt(String plain) {
        byte[] nonce = new byte[12];
        RANDOM.nextBytes(nonce);
        return "v1:"
                + Base64.getEncoder().encodeToString(nonce)
                + ":"
                + Base64.getEncoder()
                        .encodeToString(crypt(
                                Cipher.ENCRYPT_MODE, nonce, plain.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }

    String decrypt(String envelope) {
        var pieces = envelope.split(":", -1);
        if (pieces.length != 3 || !pieces[0].equals("v1"))
            throw new IllegalStateException("Webhook secret envelope invalid");
        return new String(
                crypt(
                        Cipher.DECRYPT_MODE,
                        Base64.getDecoder().decode(pieces[1]),
                        Base64.getDecoder().decode(pieces[2])),
                java.nio.charset.StandardCharsets.UTF_8);
    }

    private byte[] crypt(int mode, byte[] nonce, byte[] bytes) {
        try {
            var cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(mode, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, nonce));
            cipher.updateAAD("space/webhook".getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return cipher.doFinal(bytes);
        } catch (GeneralSecurityException corrupt) {
            throw new IllegalStateException("Webhook secret authentication failed", corrupt);
        }
    }
}
