package io.space.control.compositions.iam.managementtoken;

import static io.space.control.compositions.iam.managementtoken.ManagementTokenTypes.*;

import io.space.concepts.managementtoken.api.ManagementTokenApi;
import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** Public composition inputs, results, and finite refusal types. */
public final class ManagementTokenTypes {
    private ManagementTokenTypes() {}

    public record ManagementTokenView(
            UUID id,
            String name,
            Set<String> scopes,
            @Schema(nullable = true) UUID tenantId,
            Instant expiry,

            @Schema(allowableValues = {"active", "expired", "revoked"})
            String status,

            Instant createdAt,
            @Schema(nullable = true) Instant lastUsedAt,
            @Schema(nullable = true) Instant revokedAt) {
        static ManagementTokenView from(ManagementTokenApi.Metadata token, Instant now) {
            return new ManagementTokenView(
                    token.id(),
                    token.name(),
                    token.scopes().stream()
                            .map(ManagementTokenApi.Scope::value)
                            .collect(Collectors.toUnmodifiableSet()),
                    token.tenantId(),
                    token.expiry(),
                    token.status(now),
                    token.createdAt(),
                    token.lastUsedAt(),
                    token.revokedAt());
        }
    }

    public record IssuedManagementToken(ManagementTokenView token, String secret) {
        @Override
        public String toString() {
            return "IssuedManagementToken[token=" + token + ",secret=REDACTED]";
        }
    }

    public record ManagementTokenPage(
            List<ManagementTokenView> items,
            @Schema(nullable = true) String nextCursor) {
        public ManagementTokenPage {
            items = List.copyOf(items);
        }
    }

    public record ManagementAuthenticationContext(
            @Schema(allowableValues = {"session", "space_token", "management_token"})
            String credentialType,

            UUID actorId,
            @Schema(nullable = true) UUID credentialId,
            Set<String> scopes,
            @Schema(nullable = true) UUID tenantId,
            @Schema(nullable = true) Instant expiry) {}

    public static final class InvalidScopeException extends FlowException {
        public InvalidScopeException() {
            super(ProblemCode.INVALID_MANAGEMENT_TOKEN_SCOPE);
        }
    }

    public static final class InvalidExpiryException extends FlowException {
        public InvalidExpiryException() {
            super(ProblemCode.INVALID_TOKEN_EXPIRY);
        }
    }
}
