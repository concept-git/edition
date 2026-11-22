package io.edition.control.modules.managementtoken.api;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** 用户绑定的管理凭据；本 API 不拥有用户或资源授权事实。 */
public interface ManagementTokenApi {
    IssueResult issue(UUID owner, String name, Set<Scope> scopes, UUID tenant, Instant expiry);

    Authentication authenticate(String secret);

    Page ownedBy(UUID owner, String cursor, int limit);

    void revoke(UUID token, UUID owner);

    void revokeAll(UUID owner);

    void eraseAll(UUID owner);

    void touch(UUID token);

    enum Scope {
        CONTENT_READ("content:read"),
        CONTENT_WRITE("content:write"),
        CONTENT_PUBLISH("content:publish"),
        MEMBERS_READ("members:read"),
        MEMBERS_WRITE("members:write"),
        PERMISSIONS_READ("permissions:read"),
        PERMISSIONS_WRITE("permissions:write"),
        HOSTING_READ("hosting:read"),
        HOSTING_WRITE("hosting:write"),
        AUDIT_READ("audit:read"),
        OPERATIONS_READ("operations:read"),
        OPERATIONS_WRITE("operations:write"),
        ACCOUNT_READ("account:read"),
        ACCOUNT_WRITE("account:write"),
        PLATFORM_READ("platform:read"),
        PLATFORM_WRITE("platform:write"),
        PLATFORM_ERASE("platform:erase");

        private final String value;

        Scope(String value) {
            this.value = value;
        }

        public String value() {
            return value;
        }

        public static Scope parse(String value) {
            for (Scope scope : values()) if (scope.value.equals(value)) return scope;
            throw new IllegalArgumentException("invalid management token scope");
        }
    }

    record Metadata(
            UUID id,
            UUID ownerId,
            String name,
            Set<Scope> scopes,
            UUID tenantId,
            Instant expiry,
            Instant createdAt,
            Instant lastUsedAt,
            Instant revokedAt) {
        public Metadata {
            scopes = Set.copyOf(scopes);
        }

        public String status(Instant now) {
            return revokedAt != null ? "revoked" : !expiry.isAfter(now) ? "expired" : "active";
        }
    }

    record Page(List<Metadata> items, String nextCursor) {
        public Page {
            items = List.copyOf(items);
        }
    }

    sealed interface IssueResult {
        record Issued(Metadata metadata, String secret) implements IssueResult {
            @Override
            public String toString() {
                return "Issued[metadata=" + metadata + ", secret=REDACTED]";
            }
        }

        record InvalidScope() implements IssueResult {}

        record InvalidExpiry() implements IssueResult {}
    }

    sealed interface Authentication {
        record Authenticated(UUID id, UUID ownerId, Set<Scope> scopes, UUID tenantId, Instant expiry)
                implements Authentication {
            public Authenticated {
                scopes = Set.copyOf(scopes);
            }
        }

        record Invalid() implements Authentication {}
    }
}
