package io.edition.control.compositions.authoring.permission;

import io.edition.concepts.permission.api.PermissionApi;
import io.micrometer.tracing.Tracer;
import java.util.List;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/** 发布结构化 flow event，并写同字段无 PII 日志，供后续审计/outbox 消费。 */
@Component
class PermissionMutationPublisher {
    private final ApplicationEventPublisher events;
    private final ObjectProvider<Tracer> tracer;

    PermissionMutationPublisher(ApplicationEventPublisher events, ObjectProvider<Tracer> tracer) {
        this.events = events;
        this.tracer = tracer;
    }

    void grant(PermissionAccess.Authorized actor, UUID tenant, UUID space, PermissionApi.Principal principal) {
        publish(
                actor.actor(),
                actor.rootRecovery(),
                tenant,
                PermissionMutationEvents.Action.GRANT_PUT,
                new PermissionMutationEvents.Target("space", space),
                List.of(PermissionPrincipalKey.format(principal)));
    }

    void revoke(PermissionAccess.Authorized actor, UUID tenant, UUID space, PermissionApi.Principal principal) {
        publish(
                actor.actor(),
                actor.rootRecovery(),
                tenant,
                PermissionMutationEvents.Action.GRANT_DELETE,
                new PermissionMutationEvents.Target("space", space),
                List.of(PermissionPrincipalKey.format(principal)));
    }

    void grantSite(PermissionAccess.AuthorizedSite actor, UUID tenant, UUID site, PermissionApi.Principal principal) {
        publish(
                actor.actor(),
                actor.rootRecovery(),
                tenant,
                PermissionMutationEvents.Action.GRANT_PUT,
                new PermissionMutationEvents.Target("site", site),
                List.of(PermissionPrincipalKey.format(principal)));
    }

    void revokeSite(PermissionAccess.AuthorizedSite actor, UUID tenant, UUID site, PermissionApi.Principal principal) {
        publish(
                actor.actor(),
                actor.rootRecovery(),
                tenant,
                PermissionMutationEvents.Action.GRANT_DELETE,
                new PermissionMutationEvents.Target("site", site),
                List.of(PermissionPrincipalKey.format(principal)));
    }

    void restrict(
            PermissionAccess.Authorized actor, UUID tenant, UUID page, PermissionApi.RestrictionView restriction) {
        publish(
                actor.actor(),
                actor.rootRecovery(),
                tenant,
                PermissionMutationEvents.Action.RESTRICTION_PUT,
                new PermissionMutationEvents.Target("page", page),
                restriction.principals().stream()
                        .map(PermissionPrincipalKey::format)
                        .sorted()
                        .toList());
    }

    void unrestrict(PermissionAccess.Authorized actor, UUID tenant, UUID page) {
        publish(
                actor.actor(),
                actor.rootRecovery(),
                tenant,
                PermissionMutationEvents.Action.RESTRICTION_DELETE,
                new PermissionMutationEvents.Target("page", page),
                List.of());
    }

    private void publish(
            io.edition.control.compositions.principal.PrincipalResolver.Resolution actor,
            boolean rootRecovery,
            UUID tenant,
            PermissionMutationEvents.Action action,
            PermissionMutationEvents.Target target,
            List<String> principalKeys) {
        String requestId = MDC.get("requestId");
        if (requestId == null || requestId.isBlank()) {
            requestId = "unknown";
        }
        Tracer currentTracer = tracer.getIfAvailable();
        var span = currentTracer == null ? null : currentTracer.currentSpan();
        String traceId = span == null ? requestId : span.context().traceId();
        var event = new PermissionMutationEvents.MutationCompleted(
                actor.principal().id(), tenant, action, target, principalKeys, requestId, traceId, rootRecovery);
        events.publishEvent(event);
    }
}
