package io.edition.control.compositions.iam.apitoken;

import static io.edition.control.compositions.iam.apitoken.ApiTokenTypes.*;

import io.edition.concepts.apitoken.api.ApiTokenApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;
import java.time.Clock;

@org.springframework.stereotype.Component
final class ApiTokenDependencies {
    final ApiTokenApi tokens;
    final PermissionApi permissions;
    final TenantAccess tenants;
    final ResourceChain resources;
    final TokenRoleCeiling roles;
    final IdempotentFlowExecutor idempotency;
    final Clock clock;

    ApiTokenDependencies(
            ApiTokenApi tokens,
            PermissionApi permissions,
            TenantAccess tenants,
            ResourceChain resources,
            TokenRoleCeiling roles,
            IdempotentFlowExecutor idempotency,
            Clock clock) {
        this.tokens = tokens;
        this.permissions = permissions;
        this.tenants = tenants;
        this.resources = resources;
        this.roles = roles;
        this.idempotency = idempotency;
        this.clock = clock;
    }
}
