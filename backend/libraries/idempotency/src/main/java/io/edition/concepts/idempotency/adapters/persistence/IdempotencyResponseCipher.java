package io.edition.concepts.idempotency.adapters.persistence;

import io.edition.concepts.idempotency.api.*;
import io.edition.concepts.idempotency.api.IdempotencyApi.Command;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * Encrypts persisted idempotent responses while keeping plaintext inside the module boundary.
 */
final class IdempotencyResponseCipher {

    private static final String VERSION = "v1:";
    private static final int NONCE_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final SecretKey key;
    private final SecureRandom random;

    IdempotencyResponseCipher(SecretKey key, SecureRandom random) {
        this.key = key;
        this.random = random;
    }

    String encrypt(Command command, String plaintext) {
        byte[] nonce = new byte[NONCE_BYTES];
        random.nextBytes(nonce);
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, nonce));
            cipher.updateAAD(aad(command));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return VERSION
                    + Base64.getEncoder()
                            .encodeToString(ByteBuffer.allocate(nonce.length + ciphertext.length)
                                    .put(nonce)
                                    .put(ciphertext)
                                    .array());
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("failed to encrypt idempotency response", exception);
        }
    }

    String decrypt(Command command, String envelope) {
        try {
            if (!envelope.startsWith(VERSION)) {
                throw new IllegalStateException("unsupported idempotency response envelope");
            }
            byte[] payload = Base64.getDecoder().decode(envelope.substring(VERSION.length()));
            if (payload.length < NONCE_BYTES + TAG_BITS / Byte.SIZE) {
                throw new IllegalStateException("invalid idempotency response envelope");
            }
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, payload, 0, NONCE_BYTES));
            cipher.updateAAD(aad(command));
            return new String(
                    cipher.doFinal(payload, NONCE_BYTES, payload.length - NONCE_BYTES), StandardCharsets.UTF_8);
        } catch (AEADBadTagException | IllegalArgumentException exception) {
            throw new IllegalStateException("idempotency response authentication failed", exception);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("failed to decrypt idempotency response", exception);
        }
    }

    private static byte[] aad(Command command) {
        byte[][] fields = {
            command.principalType().getBytes(StandardCharsets.UTF_8),
            command.principalId().toString().getBytes(StandardCharsets.UTF_8),
            command.operation().getBytes(StandardCharsets.UTF_8),
            command.key().getBytes(StandardCharsets.UTF_8),
            command.requestFingerprint().getBytes(StandardCharsets.UTF_8)
        };
        int size = 0;
        for (byte[] field : fields) {
            size += Integer.BYTES + field.length;
        }
        ByteBuffer buffer = ByteBuffer.allocate(size);
        for (byte[] field : fields) {
            buffer.putInt(field.length).put(field);
        }
        return buffer.array();
    }
}
