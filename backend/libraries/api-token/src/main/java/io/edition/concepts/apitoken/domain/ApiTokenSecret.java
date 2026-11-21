package io.edition.concepts.apitoken.domain;

import io.edition.concepts.apitoken.api.*;
import io.edition.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** 高熵机器凭据：UUID 负责 O(1) 定位，仅随机段的 SHA-256 进入数据库。 */
public final class ApiTokenSecret {
    private static final Pattern FORMAT = Pattern.compile(
            "^spc_([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})_([A-Za-z0-9_-]{43})$");
    private static final SecureRandom RANDOM = new SecureRandom();

    private ApiTokenSecret() {}

    public static Issued issue(UUID token) {
        byte[] random = new byte[32];
        RANDOM.nextBytes(random);
        String segment = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        return new Issued("spc_" + token + "_" + segment, hash(segment));
    }

    public static Optional<Parsed> parse(String secret) {
        if (secret == null) return Optional.empty();
        Matcher match = FORMAT.matcher(secret);
        if (!match.matches()) return Optional.empty();
        try {
            return Optional.of(new Parsed(UUID.fromString(match.group(1)), hash(match.group(2))));
        } catch (IllegalArgumentException invalid) {
            return Optional.empty();
        }
    }

    public static boolean matches(byte[] expected, byte[] supplied) {
        return expected != null && supplied != null && MessageDigest.isEqual(expected, supplied);
    }

    private static byte[] hash(String randomSegment) {
        return Sha256.digest(randomSegment.getBytes(StandardCharsets.US_ASCII));
    }

    public record Issued(String secret, byte[] hash) {
        public Issued {
            hash = hash.clone();
        }

        @Override
        public byte[] hash() {
            return hash.clone();
        }
    }

    public record Parsed(UUID tokenId, byte[] hash) {
        public Parsed {
            hash = hash.clone();
        }

        @Override
        public byte[] hash() {
            return hash.clone();
        }
    }
}
