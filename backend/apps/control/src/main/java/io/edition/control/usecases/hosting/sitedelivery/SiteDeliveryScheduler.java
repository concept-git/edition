package io.edition.control.usecases.hosting.sitedelivery;

import io.edition.control.modules.tenantregistry.api.TenantRegistryApi.TenantId;
import io.edition.control.modules.tenantregistry.api.TenantScopeApi;
import io.edition.control.modules.webhook.api.WebhookApi;
import java.time.Clock;
import java.util.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Captures one receipt per site in the same commit that makes its changes readable. */
@Component
final class SiteDeliveryScheduler {
    private final WebhookApi hooks;
    private final TenantScopeApi scope;
    private final Clock clock;

    SiteDeliveryScheduler(WebhookApi hooks, TenantScopeApi scope, Clock clock) {
        this.hooks = hooks;
        this.scope = scope;
        this.clock = clock;
    }

    void schedule(UUID tenant, UUID site) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) return;
        @SuppressWarnings("unchecked")
        Set<Key> pending = (Set<Key>) TransactionSynchronizationManager.getResource(this);
        if (pending == null) {
            pending = new LinkedHashSet<>();
            TransactionSynchronizationManager.bindResource(this, pending);
            var captured = pending;
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void beforeCommit(boolean readOnly) {
                    if (readOnly) return;
                    captured.stream()
                            .sorted(Comparator.comparing(Key::site))
                            .forEach(key -> scope.inTenant(new TenantId(key.tenant()), () -> {
                                var id = UUID.randomUUID();
                                hooks.capture(
                                        key.tenant(),
                                        new WebhookApi.Event(
                                                id,
                                                "delivery.completed",
                                                clock.instant(),
                                                key.site(),
                                                null,
                                                key.site(),
                                                "completed",
                                                id.toString()));
                            }));
                }

                @Override
                public void afterCompletion(int status) {
                    TransactionSynchronizationManager.unbindResourceIfPossible(SiteDeliveryScheduler.this);
                }
            });
        }
        pending.add(new Key(tenant, site));
    }

    private record Key(UUID tenant, UUID site) {}
}
