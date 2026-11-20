package io.space.control.compositions.iam.apitoken;

import static io.space.control.compositions.iam.apitoken.ApiTokenTypes.*;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;
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
