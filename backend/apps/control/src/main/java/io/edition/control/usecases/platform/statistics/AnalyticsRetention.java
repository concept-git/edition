package io.edition.control.usecases.platform.statistics;

import io.edition.control.modules.analytics.api.AnalyticsApi;
import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.usecases.access.TenantAccess;
import java.time.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public final class AnalyticsRetention {
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
