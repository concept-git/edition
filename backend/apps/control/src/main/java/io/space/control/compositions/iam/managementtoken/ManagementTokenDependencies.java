package io.space.control.compositions.iam.managementtoken;

import static io.space.control.compositions.iam.managementtoken.ManagementTokenTypes.*;

import io.space.concepts.managementtoken.api.ManagementTokenApi;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.principal.PrincipalResolution;
import java.time.Clock;

@org.springframework.stereotype.Component
final class ManagementTokenDependencies {
    final ManagementTokenApi tokens;
    final PrincipalResolution principals;
    final TenantAccess tenants;
    final PlatformOperatorGuard platform;
    final IdempotentFlowExecutor idempotency;
    final Clock clock;

    ManagementTokenDependencies(
            ManagementTokenApi tokens,
            PrincipalResolution principals,
            TenantAccess tenants,
            PlatformOperatorGuard platform,
            IdempotentFlowExecutor idempotency,
            Clock clock) {
        this.tokens = tokens;
        this.principals = principals;
        this.tenants = tenants;
        this.platform = platform;
        this.idempotency = idempotency;
        this.clock = clock;
    }
}
