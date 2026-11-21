package io.edition.control.compositions.releases.bundleexport;

import static io.edition.control.compositions.releases.bundleexport.BundleExportTypes.*;

import io.edition.concepts.bundleexport.api.*;
import io.edition.concepts.objectstore.api.*;
import io.edition.control.compositions.access.TenantAccess;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DownloadExportUseCase {

    private final BundleExportAccess access;

    private final TenantAccess tenants;

    private final BundleExportJobs jobs;
    private final ObjectStoreApi objects;
    private final ObjectReservationsApi reservations;

    DownloadExportUseCase(BundleExportDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.jobs = dependencies.jobs;
        this.objects = dependencies.objects;
        this.reservations = dependencies.reservations;
    }

    @Transactional(noRollbackFor = ExportOutputMissingException.class)
    public Download downloadExport(String credential, UUID tenant, UUID space, UUID id) {
        var actor = access.require(credential, tenant, space);
        Download result = tenants.inTenant(tenant, () -> {
            var stored = jobs.find(space, id).orElseThrow(ExportProblem::notFound);
            if (stored.view().status().equals("expired")) throw ExportProblem.expired();
            if (!stored.view().status().equals("completed")) throw ExportProblem.notReady();
            access.requirePages(actor, tenant, stored.pageIds());
            reservations.protect(stored.outputKey());
            var available = objects.open(stored.outputKey());
            if (available.isEmpty()) {
                jobs.outputMissing(space, id, stored.outputKey());
                return null;
            }
            var input = available.orElseThrow();
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                    new org.springframework.transaction.support.TransactionSynchronization() {
                        @Override
                        public void afterCompletion(int status) {
                            if (status != STATUS_COMMITTED)
                                try {
                                    input.close();
                                } catch (java.io.IOException failed) {
                                    org.slf4j.LoggerFactory.getLogger(getClass())
                                            .warn("export download stream cleanup" + " failed");
                                }
                        }
                    });
            return new Download(
                    input,
                    stored.view().bytes(),
                    stored.outputKey(),
                    "release-" + stored.view().releaseId() + ".zip");
        });
        if (result == null) throw new ExportOutputMissingException();
        return result;
    }
}
