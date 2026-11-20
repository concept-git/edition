package io.space.concepts.user.domain;

import io.space.concepts.user.api.*;
import io.space.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/** 邮箱验证挑战：使用安全随机值，仅保存哈希；调用方提供当前时间以判定有效期。 */
public final class EmailVerification {

    /** 验证链接有效期；重新申请时由调用方替换旧挑战。 */
    public static final Duration VALIDITY = Duration.ofHours(24);

    private static final SecureRandom RANDOM = new SecureRandom();

    private EmailVerification() {}

    public record IssuedToken(String token, String tokenHash, Instant expiresAt) {}

    public record Challenge(String tokenHash, Instant expiresAt, boolean verified) {}

    public static IssuedToken issue(Instant now) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        return new IssuedToken(token, hash(token), now.plus(VALIDITY));
    }

    public static boolean redeems(Challenge challenge, String presentedToken, Instant now) {
        return !challenge.verified()
                && challenge.tokenHash() != null
                && challenge.expiresAt() != null
                && now.isBefore(challenge.expiresAt())
                && MessageDigest.isEqual(
                        challenge.tokenHash().getBytes(StandardCharsets.UTF_8),
                        hash(presentedToken).getBytes(StandardCharsets.UTF_8));
    }

    public static String hash(String token) {
        return Sha256.hex(token);
    }
}
