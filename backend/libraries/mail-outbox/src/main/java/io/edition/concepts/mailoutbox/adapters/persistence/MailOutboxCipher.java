package io.edition.concepts.mailoutbox.adapters.persistence;

import io.edition.concepts.mailoutbox.api.*;
import io.edition.concepts.mailoutbox.api.MailOutboxApi;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

final class MailOutboxCipher {
    private static final String VERSION = "v1:";
    private static final int NONCE_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final SecretKey key;
    private final SecureRandom random;

    MailOutboxCipher(SecretKey key, SecureRandom random) {
        this.key = key;
        this.random = random;
    }

    String encrypt(MailOutboxApi.MessageId id, MailOutboxApi.Kind kind, String recipient, String plaintext) {
        byte[] nonce = new byte[NONCE_BYTES];
        random.nextBytes(nonce);
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, nonce));
            cipher.updateAAD((id.value() + "|" + kind.value() + "|" + recipient).getBytes(StandardCharsets.UTF_8));
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return VERSION
                    + Base64.getEncoder()
                            .encodeToString(ByteBuffer.allocate(nonce.length + encrypted.length)
                                    .put(nonce)
                                    .put(encrypted)
                                    .array());
        } catch (GeneralSecurityException failure) {
            throw new IllegalStateException("failed to encrypt mail outbox payload", failure);
        }
    }

    String decrypt(Envelope envelope) {
        try {
            if (!envelope.payload().startsWith(VERSION)) throw new IllegalArgumentException("unsupported envelope");
            byte[] bytes = Base64.getDecoder().decode(envelope.payload().substring(VERSION.length()));
            if (bytes.length < NONCE_BYTES + TAG_BITS / 8) throw new IllegalArgumentException("short envelope");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, bytes, 0, NONCE_BYTES));
            cipher.updateAAD((envelope.id() + "|" + envelope.kind() + "|" + envelope.recipient())
                    .getBytes(StandardCharsets.UTF_8));
            return new String(cipher.doFinal(bytes, NONCE_BYTES, bytes.length - NONCE_BYTES), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException failure) {
            throw new IllegalStateException("mail payload authentication failed", failure);
        }
    }

    record Envelope(java.util.UUID id, String kind, String recipient, String payload) {}
}
