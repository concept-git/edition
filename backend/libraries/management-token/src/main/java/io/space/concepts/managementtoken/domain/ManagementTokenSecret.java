package io.space.concepts.managementtoken.domain;

import io.space.concepts.managementtoken.api.*;
import io.space.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

public final class ManagementTokenSecret {
    private static final Pattern FORMAT = Pattern.compile(
            "^spm_([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})_([A-Za-z0-9_-]{43})$");
    private static final SecureRandom RANDOM = new SecureRandom();

    private ManagementTokenSecret() {}

    public static Issued issue(UUID id) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String segment = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        return new Issued("spm_" + id + "_" + segment, hash(segment));
    }

    public static Optional<Parsed> parse(String secret) {
        if (secret == null) return Optional.empty();
        var match = FORMAT.matcher(secret);
        if (!match.matches()) return Optional.empty();
        return Optional.of(new Parsed(UUID.fromString(match.group(1)), hash(match.group(2))));
    }

    public static boolean matches(byte[] expected, byte[] supplied) {
        return MessageDigest.isEqual(expected, supplied);
    }

    private static byte[] hash(String value) {
        return Sha256.digest(value.getBytes(StandardCharsets.US_ASCII));
    }

    public record Issued(String secret, byte[] hash) {
        public Issued {
            hash = hash.clone();
        }

        @Override
        public byte[] hash() {
            return hash.clone();
        }

        @Override
        public String toString() {
            return "Issued[REDACTED]";
        }
    }

    public record Parsed(UUID id, byte[] hash) {
        public Parsed {
            hash = hash.clone();
        }

        @Override
        public byte[] hash() {
            return hash.clone();
        }

        @Override
        public String toString() {
            return "Parsed[id=" + id + ", hash=REDACTED]";
        }
    }
}
