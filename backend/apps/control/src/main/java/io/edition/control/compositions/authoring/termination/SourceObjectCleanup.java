package io.edition.control.compositions.authoring.termination;

import io.edition.concepts.deletionrecovery.api.DeletionRecoveryApi;
import io.edition.concepts.importjob.api.ImportJobApi;
import io.edition.concepts.objectstore.api.*;
import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.tenantregistry.api.*;
import java.util.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class SourceObjectCleanup {
    private final io.edition.concepts.bundleexport.api.BundleExportJobs exports;
    private final PageApi pages;
    private final ReleaseApi releases;
    private final ImportJobApi jobs;
    private final ObjectStoreApi objects;
    private final ObjectReservationsApi reservations;
    private final DeletionRecoveryApi operations;
    private final TenantRegistryApi tenants;
    private final TenantScopeApi scope;
    private final TransactionTemplate transactions;

    public SourceObjectCleanup(
            PageApi pages,
            ReleaseApi releases,
            ImportJobApi jobs,
            ObjectStoreApi objects,
            ObjectReservationsApi reservations,
            DeletionRecoveryApi operations,
            TenantRegistryApi tenants,
            TenantScopeApi scope,
            PlatformTransactionManager tx,
            io.edition.concepts.bundleexport.api.BundleExportJobs exports) {
        this.exports = exports;
        this.pages = pages;
        this.releases = releases;
        this.jobs = jobs;
        this.objects = objects;
        this.reservations = reservations;
        this.operations = operations;
        this.tenants = tenants;
        this.scope = scope;
        this.transactions = new TransactionTemplate(tx);
    }

    public void collect() {
        for (String key : reservations.candidates(1000)) {
            reservations.collect(key, () -> referenced(key), () -> objects.remove(key));
        }
        reservations.scan(objects);
    }

    private boolean referenced(String key) {
        String cursor = null;
        do {
            var batch = tenants.list(cursor, 100);
            for (var tenant : batch.tenants()) {
                boolean used = scope.inTenant(tenant.id(), () -> {
                    return exports.referencesObject(key)
                            || pages.referencesObject(key)
                            || releases.referencesObject(key)
                            || jobs.referencesObject(key);
                });
                if (used) return true;
            }
            cursor = batch.nextCursor();
        } while (cursor != null);
        return false;
    }

    public void reconcile(UUID tenant) {
        transactions.executeWithoutResult(tx -> scope.inTenant(new TenantRegistryApi.TenantId(tenant), () -> {
            UUID cursor = null;
            do {
                var batch = operations.deletions(cursor, 100);
                for (var record : batch) {
                    cursor = record.id();
                    if (record.status().equals("completed") || record.status().equals("failed")) continue;
                    if (reservations.failed(record.objects())) {
                        operations.finish(record.resourceId(), "failed", "object_cleanup_failed");
                        continue;
                    }
                    boolean pending = false;
                    // Shared objects may legitimately remain; only this
                    // operation's unreferenced bytes must disappear.
                    try {
                        for (String key : record.objects()) {
                            if (objects.exists(key) && !referenced(key)) {
                                pending = true;
                                break;
                            }
                        }
                    } catch (ObjectStoreApi.Unavailable unavailable) {
                        operations.finish(record.resourceId(), "retrying", "dependency_unavailable");
                        continue;
                    }
                    operations.finish(record.resourceId(), pending ? "running" : "completed", null);
                }
                if (batch.size() < 100) break;
            } while (cursor != null);
            return null;
        }));
    }
}
