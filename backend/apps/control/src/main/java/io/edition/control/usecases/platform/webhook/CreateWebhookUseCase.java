package io.edition.control.usecases.platform.webhook;

import static io.edition.control.usecases.platform.webhook.WebhookTypes.*;

import io.edition.control.modules.webhook.api.WebhookApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class CreateWebhookUseCase {
    private final WebhookApi hooks;
    private final WebhookAccess access;
    private final TenantAccess tenants;
    private final IdempotentFlowExecutor idempotency;

    CreateWebhookUseCase(WebhookDependencies dependencies) {
        this.hooks = dependencies.hooks;
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<SecretResult> createWebhook(String credential, UUID tenant, Configuration input, String key) {
        var who = access.require(credential, tenant);
        access.configuration(input);
        return idempotency.execute(
                who.principal(),
                key,
                "webhook.create",
                IdempotentFlowExecutor.canonical(tenant, input.canonical()),
                201,
                SecretResult.class,
                () -> tenants.inTenant(tenant, () -> {
                    access.scope(tenant, input.scopeType(), input.scopeId());
                    var result = hooks.create(tenant, input.url(), input.scopeType(), input.scopeId(), input.events());
                    access.recorded(
                            tenant,
                            who.principal().id(),
                            "create",
                            result.subscription().id());
                    if (!input.active())
                        hooks.update(
                                result.subscription().id(),
                                input.url(),
                                input.scopeType(),
                                input.scopeId(),
                                input.events(),
                                false);
                    return new SecretResult(
                            Subscription.of(
                                    access.subscription(result.subscription().id())),
                            result.secret());
                }));
    }
}
