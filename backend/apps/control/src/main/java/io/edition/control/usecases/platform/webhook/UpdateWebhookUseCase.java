package io.edition.control.usecases.platform.webhook;

import static io.edition.control.usecases.platform.webhook.WebhookTypes.*;

import io.edition.control.modules.webhook.api.WebhookApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class UpdateWebhookUseCase {
    private final WebhookApi hooks;
    private final WebhookAccess access;
    private final TenantAccess tenants;
    private final IdempotentFlowExecutor idempotency;

    UpdateWebhookUseCase(WebhookDependencies dependencies) {
        this.hooks = dependencies.hooks;
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<Subscription> updateWebhook(
            String credential, UUID tenant, UUID id, Configuration input, String key) {
        var who = access.require(credential, tenant);
        access.configuration(input);
        return idempotency.execute(
                who.principal(),
                key,
                "webhook.update",
                IdempotentFlowExecutor.canonical(tenant, id, input.canonical()),
                200,
                Subscription.class,
                () -> tenants.inTenant(tenant, () -> {
                    access.subscription(id);
                    access.scope(tenant, input.scopeType(), input.scopeId());
                    hooks.update(id, input.url(), input.scopeType(), input.scopeId(), input.events(), input.active());
                    access.recorded(tenant, who.principal().id(), "update", id);
                    return Subscription.of(access.subscription(id));
                }));
    }
}
