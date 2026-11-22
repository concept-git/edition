package io.edition.control.usecases.releases.bundleimport;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** 受理事务提交后再入队执行，使 HTTP 202 不等待 inspect→mirror。 */
@Component
class ImportJobCommitListener {
    private final BundleImportJobRunner runner;
    private final TaskExecutor executor;

    ImportJobCommitListener(
            BundleImportJobRunner runner, @Qualifier(ImportJobExecutorConfig.BEAN) TaskExecutor executor) {
        this.runner = runner;
        this.executor = executor;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onQueued(ImportQueued event) {
        try {
            executor.execute(() -> runner.run(event.tenantId(), event.jobId()));
        } catch (org.springframework.core.task.TaskRejectedException saturated) {
            org.slf4j.LoggerFactory.getLogger(getClass())
                    .warn("Import executor saturated; durable scanner will retry job={}", event.jobId());
        }
    }
}
