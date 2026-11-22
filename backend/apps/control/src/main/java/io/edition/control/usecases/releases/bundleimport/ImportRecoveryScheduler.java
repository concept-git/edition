package io.edition.control.usecases.releases.bundleimport;

import io.edition.control.modules.importjob.api.ImportJobApi;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Component;

@Component
public class ImportRecoveryScheduler {
    private final ImportJobApi jobs;
    private final BundleImportJobRunner runner;
    private final TaskExecutor executor;

    public ImportRecoveryScheduler(
            ImportJobApi jobs,
            BundleImportJobRunner runner,
            @Qualifier(ImportJobExecutorConfig.BEAN) TaskExecutor executor) {
        this.jobs = jobs;
        this.runner = runner;
        this.executor = executor;
    }

    public void recover() {
        for (var job : jobs.pending(100)) {
            try {
                executor.execute(() -> runner.run(job.tenantId(), job.jobId()));
            } catch (org.springframework.core.task.TaskRejectedException saturated) {
                return;
            }
        }
    }
}
