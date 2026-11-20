package io.space.control.compositions.authoring.termination;

import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "io.space.operations.scheduling-enabled", havingValue = "true", matchIfMissing = true)
public class TerminationScheduler {
    private final TenantRegistryApi tenants;
    private final PurgeExpiredUseCase purgeExpiredUseCase;
    private final SourceObjectCleanup cleanup;

    public TerminationScheduler(
            TenantRegistryApi tenants, PurgeExpiredUseCase purgeExpiredUseCase, SourceObjectCleanup cleanup) {
        this.tenants = tenants;
        this.purgeExpiredUseCase = purgeExpiredUseCase;
        this.cleanup = cleanup;
    }

    @Scheduled(
            initialDelayString = "${io.space.trash.initial-delay:60000}",
            fixedDelayString = "${io.space.trash.scan-delay:3600000}")
    public void purge() {
        String cursor = null;
        do {
            var batch = tenants.list(cursor, 100);
            for (var tenant : batch.tenants()) {
                try {
                    purgeExpiredUseCase.purgeExpired(tenant.id().value());
                } catch (org.springframework.dao.DataAccessException
                        | io.space.concepts.objectstore.api.ObjectStoreApi.Unavailable failure) {
                    logFailure("purge", tenant.id().value(), failure);
                }
            }
            cursor = batch.nextCursor();
        } while (cursor != null);
    }

    @Scheduled(initialDelay = 60000, fixedDelay = 60000)
    public void cleanup() {
        try {
            cleanup.collect();
        } catch (org.springframework.dao.DataAccessException
                | io.space.concepts.objectstore.api.ObjectStoreApi.Unavailable failure) {
            logFailure("objects", null, failure);
        }
        String cursor = null;
        do {
            var batch = tenants.list(cursor, 100);
            for (var tenant : batch.tenants()) {
                try {
                    cleanup.reconcile(tenant.id().value());
                } catch (org.springframework.dao.DataAccessException
                        | io.space.concepts.objectstore.api.ObjectStoreApi.Unavailable failure) {
                    logFailure("cleanup", tenant.id().value(), failure);
                }
            }
            cursor = batch.nextCursor();
        } while (cursor != null);
    }

    private void logFailure(String action, java.util.UUID tenant, RuntimeException failure) {
        org.slf4j.LoggerFactory.getLogger(getClass())
                .atError()
                .addKeyValue("action", action)
                .addKeyValue("tenant", tenant)
                .addKeyValue("errorType", failure.getClass().getSimpleName())
                .log("Terminal operation worker failed; state retained for recovery");
    }
}
