package io.edition.control.usecases.platform.webhook;

import static io.edition.control.usecases.platform.webhook.WebhookTypes.*;

import io.edition.control.modules.webhook.api.WebhookApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RedeliverUseCase {
    private final WebhookApi hooks;
    private final WebhookAccess access;
    private final TenantAccess tenants;
    private final IdempotentFlowExecutor idempotency;

    RedeliverUseCase(WebhookDependencies dependencies) {
        this.hooks = dependencies.hooks;
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public void redeliver(String credential, UUID tenant, UUID id, UUID delivery, String key) {
        var who = access.require(credential, tenant);
        idempotency.execute(
                who.principal(),
                key,
                "webhook.redeliver",
                IdempotentFlowExecutor.canonical(tenant, id, delivery),
                () -> tenants.inTenant(tenant, () -> {
                    if (!access.subscription(id).active()) throw new WebhookAccess.Disabled();
                    if (!hooks.redeliver(id, delivery)) throw new WebhookAccess.NotReplayable();
                    access.recorded(tenant, who.principal().id(), "redeliver", id);
                }));
    }
}
