package io.space.control.compositions.platform.webhook;

import static io.space.control.compositions.platform.webhook.WebhookTypes.*;

import io.space.concepts.webhook.api.WebhookApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import java.util.*;

@org.springframework.stereotype.Component
final class WebhookDependencies {
    final WebhookApi hooks;
    final WebhookAccess access;
    final TenantAccess tenants;
    final IdempotentFlowExecutor idempotency;

    public WebhookDependencies(
            WebhookApi hooks, WebhookAccess access, TenantAccess tenants, IdempotentFlowExecutor idempotency) {
        this.hooks = hooks;
        this.access = access;
        this.tenants = tenants;
        this.idempotency = idempotency;
    }
}
