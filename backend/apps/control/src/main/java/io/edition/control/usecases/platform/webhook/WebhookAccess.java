package io.edition.control.usecases.platform.webhook;

import io.edition.control.modules.audit.api.AuditApi;
import io.edition.control.modules.webhook.api.WebhookApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.control.usecases.principal.PrincipalResolver;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
public class WebhookAccess {
    private final TenantAccess tenants;
    private final WebhookApi hooks;
    private final ResourceChain resources;
    private final AuditApi audit;

    public WebhookAccess(TenantAccess tenants, WebhookApi hooks, ResourceChain resources, AuditApi audit) {
        this.tenants = tenants;
        this.hooks = hooks;
        this.resources = resources;
        this.audit = audit;
    }

    public PrincipalResolver.Resolution require(String credential, UUID tenant) {
        return tenants.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
    }

    public WebhookApi.Subscription subscription(UUID id) {
        return hooks.view(id).orElseThrow(Missing::new);
    }

    public void configuration(WebhookTypes.Configuration input) {
        if (input == null
                || !WebhookApi.validConfiguration(input.url(), input.scopeType(), input.scopeId(), input.events()))
            throw new Invalid();
    }

    public static class Invalid extends FlowException {
        public Invalid() {
            super(
                    ProblemCode.VALIDATION_FAILED,
                    List.of(new io.edition.shared.ValidationViolation("configuration", "invalid")));
        }
    }

    public void scope(UUID tenant, String type, UUID id) {
        if ("space".equals(type) && resources.space(tenant, id).isEmpty()) throw new Missing();
        if ("site".equals(type) && resources.site(tenant, id).isEmpty()) throw new Missing();
    }

    public void recorded(UUID tenant, UUID actor, String action, UUID id) {
        var c = RequestAuditContext.current();
        audit.append(new AuditApi.Event(
                tenant,
                UUID.randomUUID(),
                c.rootId(),
                "fact",
                "user",
                actor,
                "Webhook." + action,
                "webhook",
                id,
                "ok",
                c.ip(),
                c.requestId()));
    }

    public static class Missing extends FlowException {
        public Missing() {
            super(ProblemCode.RESOURCE_NOT_FOUND);
        }
    }

    public static class Disabled extends FlowException {
        public Disabled() {
            super(ProblemCode.WEBHOOK_DISABLED);
        }
    }

    public static class NotReplayable extends FlowException {
        public NotReplayable() {
            super(ProblemCode.WEBHOOK_DELIVERY_NOT_REPLAYABLE);
        }
    }
}
