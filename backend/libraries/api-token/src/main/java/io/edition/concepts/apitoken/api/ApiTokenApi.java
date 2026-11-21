package io.edition.concepts.apitoken.api;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/** ApiToken 概念唯一出口；认证结果永远是 token 自身，不返回 owner 身份。 */
public interface ApiTokenApi {

    /** 签发限时且权限范围非空的机器身份；明文仅返回本次，之后只保存随机段散列。 */
    IssueResult issue(UUID owner, UUID tenant, UUID space, String name, Set<Scope> scopes, Instant expiry);

    /** 幂等撤销，保留元数据与首次撤销时刻供审计使用。 */
    void revoke(TokenId token);

    /** 保留稳定身份，清除展示名并替换认证散列为随机墓碑。 */
    void anonymize(TokenId token);

    /** 只读校验格式、散列、期限与撤销状态；不继承签发者的权限。 */
    Authentication authenticate(String secret);

    List<Metadata> ownedBy(UUID owner, UUID tenant, boolean includeRevoked);

    List<Metadata> ownedBy(UUID owner, boolean includeRevoked);

    List<Metadata> inSpace(UUID tenant, UUID space, boolean includeRevoked);

    Optional<Metadata> metadata(TokenId token);

    /** 当前租户的受限交付投影；散列只供内部验证，不开放 HTTP。 */
    List<Verifier> verifiers(UUID tenant);

    record Verifier(UUID id, UUID tenant, UUID space, String hash, Set<Scope> scopes, Instant expiry, boolean active) {
        public Verifier {
            scopes = Set.copyOf(scopes);
        }
    }

    record TokenId(UUID value) {
        public TokenId {
            Objects.requireNonNull(value, "token id");
        }
    }

    enum Scope {
        READ,
        WRITE,
        PUBLISH;

        public String value() {
            return name().toLowerCase(Locale.ROOT);
        }

        public static Scope parse(String value) {
            return Scope.valueOf(value.strip().toUpperCase(Locale.ROOT));
        }
    }

    sealed interface IssueResult {
        record Issued(Metadata metadata, String secret) implements IssueResult {}

        record InvalidScope() implements IssueResult {}

        record InvalidExpiry() implements IssueResult {}
    }

    sealed interface Authentication {
        record Authenticated(TokenId token, UUID tenant, UUID space, Set<Scope> scopes) implements Authentication {
            public Authenticated {
                scopes = Set.copyOf(scopes);
            }
        }

        record Invalid() implements Authentication {}
    }

    record Metadata(
            TokenId id,
            UUID ownerId,
            UUID tenantId,
            UUID spaceId,
            String name,
            Set<Scope> scopes,
            Instant expiry,
            Instant revokedAt,
            Instant createdAt) {
        public Metadata {
            scopes = Set.copyOf(scopes);
        }

        public String status(Instant now) {
            Objects.requireNonNull(now, "current time");
            if (revokedAt != null) return "revoked";
            if (!expiry.isAfter(now)) return "expired";
            return "active";
        }
    }
}
