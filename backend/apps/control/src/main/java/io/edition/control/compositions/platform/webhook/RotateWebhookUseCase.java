package io.edition.control.compositions.platform.webhook;

import static io.edition.control.compositions.platform.webhook.WebhookTypes.*;

import io.edition.concepts.webhook.api.WebhookApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RotateWebhookUseCase {
    private final WebhookApi hooks;
    private final WebhookAccess access;
    private final TenantAccess tenants;
    private final IdempotentFlowExecutor idempotency;

    RotateWebhookUseCase(WebhookDependencies dependencies) {
        this.hooks = dependencies.hooks;
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<SecretResult> rotateWebhook(String credential, UUID tenant, UUID id, String key) {
        var who = access.require(credential, tenant);
        return idempotency.execute(
                who.principal(),
                key,
                "webhook.rotate",
                IdempotentFlowExecutor.canonical(tenant, id),
                200,
                SecretResult.class,
                () -> tenants.inTenant(tenant, () -> {
                    var subscription = access.subscription(id);
                    String secret = hooks.rotate(id);
                    access.recorded(tenant, who.principal().id(), "rotate", id);
                    return new SecretResult(Subscription.of(subscription), secret);
                }));
    }
}
