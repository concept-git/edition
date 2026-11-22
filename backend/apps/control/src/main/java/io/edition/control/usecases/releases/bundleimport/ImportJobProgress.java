package io.edition.control.usecases.releases.bundleimport;

import io.edition.control.modules.importjob.api.ImportJobApi;
import io.edition.control.usecases.access.TenantAccess;
import org.springframework.stereotype.Component;
import org.springframework.transaction.*;
import org.springframework.transaction.support.TransactionTemplate;

/** Progress commits independently of the atomic release/mirror transaction. */
@Component
public class ImportJobProgress {
    private final TransactionTemplate tx;
    private final ImportJobApi jobs;
    private final TenantAccess tenants;

    public ImportJobProgress(PlatformTransactionManager manager, ImportJobApi jobs, TenantAccess tenants) {
        tx = new TransactionTemplate(manager);
        tx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.jobs = jobs;
        this.tenants = tenants;
    }

    public ImportJobApi.View start(ImportJobApi.View job) {
        return tx.execute(status -> tenants.inTenant(job.tenantId(), () -> jobs.markRunning(job.id(), "inspecting")));
    }

    public void report(ImportJobApi.View job, ImportJobApi.Report report) {
        tx.executeWithoutResult(status -> tenants.inTenant(job.tenantId(), () -> jobs.saveReport(job.id(), report)));
    }

    public void phase(ImportJobApi.View job, String phase, Integer done, Integer total) {
        tx.executeWithoutResult(
                status -> tenants.inTenant(job.tenantId(), () -> jobs.markProgress(job.id(), phase, done, total)));
    }
}
