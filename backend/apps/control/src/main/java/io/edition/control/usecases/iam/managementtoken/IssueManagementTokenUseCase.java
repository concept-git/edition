package io.edition.control.usecases.iam.managementtoken;

import static io.edition.control.usecases.iam.managementtoken.ManagementTokenTypes.*;

import io.edition.control.modules.managementtoken.api.ManagementTokenApi;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolution;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Clock;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class IssueManagementTokenUseCase {
    private final ManagementTokenApi tokens;
    private final PrincipalResolution principals;
    private final TenantAccess tenants;
    private final PlatformOperatorGuard platform;
    private final IdempotentFlowExecutor idempotency;
    private final Clock clock;

    IssueManagementTokenUseCase(ManagementTokenDependencies dependencies) {
        this.tokens = dependencies.tokens;
        this.principals = dependencies.principals;
        this.tenants = dependencies.tenants;
        this.platform = dependencies.platform;
        this.idempotency = dependencies.idempotency;
        this.clock = dependencies.clock;
    }

    @Transactional
    public FlowResponse<IssuedManagementToken> issueManagementToken(
            String credential,
            String key,
            String name,
            Set<String> scopes,
            UUID tenant,
            @Schema(nullable = true) Instant expiry) {
        UUID owner = principals.requireSessionUser(credential);
        var resolution = principals.require(credential);
        if (tenant != null) tenants.admitUser(credential, tenant);
        Set<ManagementTokenApi.Scope> parsed;
        try {
            parsed = scopes.stream().map(ManagementTokenApi.Scope::parse).collect(Collectors.toUnmodifiableSet());
        } catch (IllegalArgumentException invalid) {
            throw new InvalidScopeException();
        }
        if (tenant != null && parsed.stream().anyMatch(s -> s.value().startsWith("account:")))
            throw new InvalidScopeException();
        if (parsed.stream().anyMatch(s -> s.value().startsWith("platform:"))) {
            if (tenant != null) throw new InvalidScopeException();
            platform.require(resolution);
        }
        String canonical = IdempotentFlowExecutor.canonical(
                name.strip(), scopes.stream().sorted().toList(), tenant, expiry);
        return idempotency.execute(
                resolution.principal(),
                key,
                "management-token.issue",
                canonical,
                201,
                IssuedManagementToken.class,
                () -> {
                    var result = tokens.issue(owner, name, parsed, tenant, expiry);
                    return switch (result) {
                        case ManagementTokenApi.IssueResult.Issued issued ->
                            new IssuedManagementToken(
                                    ManagementTokenView.from(issued.metadata(), clock.instant()), issued.secret());
                        case ManagementTokenApi.IssueResult.InvalidScope ignored -> throw new InvalidScopeException();
                        case ManagementTokenApi.IssueResult.InvalidExpiry ignored -> throw new InvalidExpiryException();
                    };
                });
    }
}
