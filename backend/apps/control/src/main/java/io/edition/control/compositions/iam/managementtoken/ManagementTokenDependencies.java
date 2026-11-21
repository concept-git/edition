package io.edition.control.compositions.iam.managementtoken;

import static io.edition.control.compositions.iam.managementtoken.ManagementTokenTypes.*;

import io.edition.concepts.managementtoken.api.ManagementTokenApi;
import io.edition.control.compositions.access.PlatformOperatorGuard;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolution;
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
