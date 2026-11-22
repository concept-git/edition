package io.edition.control.usecases.platform.webhook;

import static io.edition.control.usecases.platform.webhook.WebhookTypes.*;

import io.edition.control.modules.webhook.api.WebhookApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.shared.PageWindow;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListDeliveriesUseCase {
    private final WebhookApi hooks;
    private final WebhookAccess access;
    private final TenantAccess tenants;

    ListDeliveriesUseCase(WebhookDependencies dependencies) {
        this.hooks = dependencies.hooks;
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
    }

    @Transactional(readOnly = true)
    public DeliveryPage listDeliveries(String credential, UUID tenant, UUID id, UUID cursor, int limit) {
        access.require(credential, tenant);
        return tenants.inTenant(tenant, () -> {
            access.subscription(id);
            var rows = hooks.deliveries(id, cursor, limit + 1);
            var window = PageWindow.of(rows, limit, WebhookApi.Delivery::id);
            return new DeliveryPage(
                    window.items().stream()
                            .map(d -> new Delivery(
                                    d.id(),
                                    d.eventId(),
                                    d.eventType(),
                                    d.status(),
                                    d.attempts(),
                                    d.nextRunAt(),
                                    d.responseCode(),
                                    d.createdAt(),
                                    hooks.attempts(d.id()).stream()
                                            .map(a -> new Attempt(
                                                    a.id(), a.startedAt(), a.responseCode(), a.error(), a.durationMs()))
                                            .toList()))
                            .toList(),
                    window.nextCursor());
        });
    }
}
