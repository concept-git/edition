package io.edition.control.usecases.platform.webhook;

import static io.edition.control.usecases.platform.webhook.WebhookTypes.*;

import io.edition.control.modules.webhook.api.WebhookApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
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
