package io.space.control.compositions.iam.apitoken;

import static io.space.control.compositions.iam.apitoken.ApiTokenTypes.*;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.shared.ValidationViolation;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** Public composition inputs, results, and finite refusal types. */
public final class ApiTokenTypes {
    private ApiTokenTypes() {}

    public record IssuedToken(
            UUID id,
            String name,
            UUID ownerId,
            UUID tenantId,
            UUID spaceId,
            String role,
            Set<String> scopes,
            Instant expiry,
            String status,
            Instant createdAt,
            String secret) {
        static IssuedToken from(ApiTokenApi.IssueResult.Issued issued, String role, Instant now) {
            var token = issued.metadata();
            return new IssuedToken(
                    token.id().value(),
                    token.name(),
                    token.ownerId(),
                    token.tenantId(),
                    token.spaceId(),
                    role,
                    token.scopes().stream().map(ApiTokenApi.Scope::value).collect(Collectors.toUnmodifiableSet()),
                    token.expiry(),
                    token.status(now),
                    token.createdAt(),
                    issued.secret());
        }
    }

    public record TokenView(
            UUID id,
            String name,
            UUID ownerId,
            UUID tenantId,
            UUID spaceId,
            String role,
            Set<String> scopes,
            Instant expiry,
            String status,
            Instant createdAt) {
        static TokenView from(ApiTokenApi.Metadata token, String role, Instant now) {
            return new TokenView(
                    token.id().value(),
                    token.name(),
                    token.ownerId(),
                    token.tenantId(),
                    token.spaceId(),
                    role,
                    token.scopes().stream().map(ApiTokenApi.Scope::value).collect(Collectors.toUnmodifiableSet()),
                    token.expiry(),
                    token.status(now),
                    token.createdAt());
        }
    }

    public record TokenPage(List<TokenView> tokens, String nextCursor, long total) {
        public TokenPage {
            tokens = List.copyOf(tokens);
        }
    }

    public static final class InvalidTokenScopeException extends FlowException {
        public InvalidTokenScopeException() {
            super(ProblemCode.INVALID_TOKEN_SCOPE, List.of(new ValidationViolation("scopes", "invalid_token_scope")));
        }
    }

    public static final class InvalidTokenExpiryException extends FlowException {
        public InvalidTokenExpiryException() {
            super(ProblemCode.INVALID_TOKEN_EXPIRY, List.of(new ValidationViolation("expiry", "invalid_token_expiry")));
        }
    }

    public static final class TokenRoleInvalidException extends FlowException {
        public TokenRoleInvalidException() {
            super(ProblemCode.INVALID_TOKEN_ROLE, List.of(new ValidationViolation("role", "invalid_token_role")));
        }
    }

    public static final class RoleEscalationForbiddenException extends FlowException {
        public RoleEscalationForbiddenException() {
            super(ProblemCode.ROLE_ESCALATION_FORBIDDEN);
        }
    }

    public static final class TenantSpaceMismatchException extends FlowException {
        public TenantSpaceMismatchException() {
            super(ProblemCode.TENANT_SPACE_MISMATCH);
        }
    }

    public static final class TokenNotFoundException extends FlowException {
        public TokenNotFoundException() {
            super(ProblemCode.TOKEN_NOT_FOUND);
        }
    }
}
