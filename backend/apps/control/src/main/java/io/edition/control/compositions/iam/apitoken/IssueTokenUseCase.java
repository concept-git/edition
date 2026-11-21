package io.edition.control.compositions.iam.apitoken;

import static io.edition.control.compositions.iam.apitoken.ApiTokenTypes.*;

import io.edition.concepts.apitoken.api.ApiTokenApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;
import java.time.Clock;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class IssueTokenUseCase {
    private final ApiTokenApi tokens;
    private final PermissionApi permissions;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final TokenRoleCeiling roles;
    private final IdempotentFlowExecutor idempotency;
    private final Clock clock;

    IssueTokenUseCase(ApiTokenDependencies dependencies) {
        this.tokens = dependencies.tokens;
        this.permissions = dependencies.permissions;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.roles = dependencies.roles;
        this.idempotency = dependencies.idempotency;
        this.clock = dependencies.clock;
    }

    @Transactional
    public FlowResponse<IssuedToken> issueToken(
            String credential,
            String key,
            UUID tenant,
            String name,
            UUID space,
            String role,
            Set<String> scopes,
            Instant expiry) {
        var issuer = tenants.admitUser(credential, tenant);
        resources.space(tenant, space).orElseThrow(TenantSpaceMismatchException::new);
        var allowedRole = roles.allowedRole(tenant, space, issuer, role);
        final Set<ApiTokenApi.Scope> parsedScopes;
        try {
            parsedScopes = scopes == null
                    ? Set.of()
                    : scopes.stream().map(ApiTokenApi.Scope::parse).collect(Collectors.toUnmodifiableSet());
        } catch (IllegalArgumentException invalid) {
            throw new InvalidTokenScopeException();
        }
        String canonical = IdempotentFlowExecutor.canonical(
                tenant,
                name.strip(),
                space,
                allowedRole.value(),
                parsedScopes.stream().map(ApiTokenApi.Scope::value).sorted().toList(),
                expiry);

        return idempotency.execute(
                issuer.principal(),
                key,
                "api-token.issue",
                canonical,
                201,
                IssuedToken.class,
                () -> tenants.inTenant(tenant, () -> {
                    ApiTokenApi.IssueResult result =
                            tokens.issue(issuer.principal().id(), tenant, space, name, parsedScopes, expiry);
                    var issued =
                            switch (result) {
                                case ApiTokenApi.IssueResult.Issued ok -> ok;
                                case ApiTokenApi.IssueResult.InvalidScope ignored ->
                                    throw new InvalidTokenScopeException();
                                case ApiTokenApi.IssueResult.InvalidExpiry ignored ->
                                    throw new InvalidTokenExpiryException();
                            };
                    permissions.grant(
                            TenantAccess.space(space),
                            new PermissionApi.Principal(
                                    PermissionApi.PrincipalType.TOKEN,
                                    issued.metadata().id().value()),
                            allowedRole);
                    return IssuedToken.from(issued, allowedRole.value(), clock.instant());
                }));
    }
}
