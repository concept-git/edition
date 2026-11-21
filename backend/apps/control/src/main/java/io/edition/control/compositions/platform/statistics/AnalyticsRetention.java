package io.edition.control.compositions.platform.statistics;

import io.edition.concepts.analytics.api.AnalyticsApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.control.compositions.access.TenantAccess;
import java.time.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@ConditionalOnProperty(name = "io.edition.operations.scheduling-enabled", havingValue = "true", matchIfMissing = true)
final class AnalyticsRetention {
    private final AnalyticsApi analytics;
    private final TenantRegistryApi tenants;
    private final TenantAccess scope;
    private final TransactionTemplate tx;
    private final Clock clock;

    AnalyticsRetention(
            AnalyticsApi analytics,
            TenantRegistryApi tenants,
            TenantAccess scope,
            PlatformTransactionManager manager,
            Clock clock) {
        this.analytics = analytics;
        this.tenants = tenants;
        this.scope = scope;
        this.tx = new TransactionTemplate(manager);
        this.clock = clock;
    }

    @Scheduled(initialDelay = 60000, fixedDelay = 86400000)
    public void retain() {
        String cursor = null;
        do {
            var batch = tenants.list(cursor, 100);
            for (var tenant : batch.tenants())
                tx.executeWithoutResult(status -> scope.inTenant(
                        tenant.id().value(),
                        () -> analytics.retain(
                                clock.instant().minus(Duration.ofDays(30)),
                                clock.instant().minus(Duration.ofDays(366)))));
            cursor = batch.nextCursor();
        } while (cursor != null);
    }
}
