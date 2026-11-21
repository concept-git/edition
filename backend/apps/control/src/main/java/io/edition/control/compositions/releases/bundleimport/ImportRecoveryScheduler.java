package io.edition.control.compositions.releases.bundleimport;

import io.edition.concepts.importjob.api.ImportJobApi;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "io.edition.operations.scheduling-enabled", havingValue = "true", matchIfMissing = true)
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

    @Scheduled(initialDelay = 5000, fixedDelay = 5000)
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
