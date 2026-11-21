package io.edition.control.compositions.platform.webhook;

import static io.edition.control.compositions.platform.webhook.WebhookTypes.*;

import io.edition.concepts.webhook.api.WebhookApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.shared.PageWindow;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListWebhooksUseCase {
    private final WebhookApi hooks;
    private final WebhookAccess access;
    private final TenantAccess tenants;

    ListWebhooksUseCase(WebhookDependencies dependencies) {
        this.hooks = dependencies.hooks;
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
    }

    @Transactional(readOnly = true)
    public SubscriptionPage listWebhooks(String credential, UUID tenant, UUID before, int limit) {
        access.require(credential, tenant);
        return tenants.inTenant(tenant, () -> {
            var rows = hooks.list(before, limit + 1);
            var window = PageWindow.of(rows, limit, WebhookApi.Subscription::id);
            return new SubscriptionPage(
                    window.items().stream().map(Subscription::of).toList(), window.nextCursor(), WebhookApi.EVENTS);
        });
    }
}
