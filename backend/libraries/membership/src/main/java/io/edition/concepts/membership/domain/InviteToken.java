package io.edition.concepts.membership.domain;

import io.edition.concepts.membership.api.*;
import io.edition.shared.Sha256;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/** 邀请令牌：使用安全随机值，仅保存哈希；调用方提供当前时间以判定有效期。 */
public final class InviteToken {

    /** 邀请有效期；重新邀请时由调用方替换旧邀请。 */
    public static final Duration VALIDITY = Duration.ofDays(7);

    private static final SecureRandom RANDOM = new SecureRandom();

    private InviteToken() {}

    public record IssuedToken(String token, String tokenHash, Instant expiresAt) {}

    public static IssuedToken issue(Instant now) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        return new IssuedToken(token, hash(token), now.plus(VALIDITY));
    }

    public static boolean redeems(Instant expiresAt, Instant now) {
        return expiresAt != null && now.isBefore(expiresAt);
    }

    public static String hash(String token) {
        return Sha256.hex(token);
    }
}
