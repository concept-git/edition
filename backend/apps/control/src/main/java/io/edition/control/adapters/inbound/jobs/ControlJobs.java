package io.edition.control.adapters.inbound.jobs;

import io.edition.control.usecases.authoring.termination.TerminationScheduler;
import io.edition.control.usecases.platform.maildelivery.DeliverMailOnSchedule;
import io.edition.control.usecases.platform.operations.AuditExportWorker;
import io.edition.control.usecases.platform.servicehealth.HeartbeatOnSchedule;
import io.edition.control.usecases.platform.statistics.AnalyticsRetention;
import io.edition.control.usecases.platform.webhook.AuditRetention;
import io.edition.control.usecases.releases.bundleexport.BundleExportWorker;
import io.edition.control.usecases.releases.bundleimport.ImportRecoveryScheduler;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Inbound triggers. Each job calls one use-case rule and owns no business policy. */
final class ControlJobs {
    private ControlJobs() {}

    @Component
    public static class HeartbeatJob {
        private final HeartbeatOnSchedule rule;

        HeartbeatJob(HeartbeatOnSchedule rule) {
            this.rule = rule;
        }

        @Scheduled(
                initialDelayString = "${io.edition.health.initial-delay-ms:5000}",
                fixedDelayString = "${io.edition.health.heartbeat-ms:30000}")
        public void heartbeat() {
            rule.heartbeat();
        }
    }

    @Component
    @ConditionalOnProperty(name = "io.edition.mail-outbox.enabled", havingValue = "true")
    public static class DeliverMailJob {
        private final DeliverMailOnSchedule rule;

        DeliverMailJob(DeliverMailOnSchedule rule) {
            this.rule = rule;
        }

        @Scheduled(
                initialDelayString = "${io.edition.mail-outbox.initial-delay-ms:0}",
                fixedDelayString = "${io.edition.mail-outbox.poll-ms:1000}")
        public void deliverMail() {
            rule.deliverMail();
        }
    }

    @Component
    @ConditionalOnProperty(
            name = "io.edition.operations.scheduling-enabled",
            havingValue = "true",
            matchIfMissing = true)
    public static class TerminationJob {
        private final TerminationScheduler rule;

        TerminationJob(TerminationScheduler rule) {
            this.rule = rule;
        }

        @Scheduled(
                initialDelayString = "${io.edition.trash.initial-delay:60000}",
                fixedDelayString = "${io.edition.trash.scan-delay:3600000}")
        public void purge() {
            rule.purge();
        }

        @Scheduled(initialDelay = 60000, fixedDelay = 60000)
        public void cleanup() {
            rule.cleanup();
        }
    }

    @Component
    @ConditionalOnProperty(
            name = "io.edition.operations.scheduling-enabled",
            havingValue = "true",
            matchIfMissing = true)
    public static class ImportRecoveryJob {
        private final ImportRecoveryScheduler rule;

        ImportRecoveryJob(ImportRecoveryScheduler rule) {
            this.rule = rule;
        }

        @Scheduled(initialDelay = 5000, fixedDelay = 5000)
        public void recover() {
            rule.recover();
        }
    }

    @Component
    public static class BundleExportJob {
        private final BundleExportWorker rule;

        BundleExportJob(BundleExportWorker rule) {
            this.rule = rule;
        }

        @Scheduled(
                initialDelayString = "${io.edition.bundle-export.initial-delay:1000}",
                fixedDelayString = "${io.edition.bundle-export.poll-delay:500}")
        public void poll() {
            rule.poll();
        }
    }

    @Component
    @ConditionalOnProperty(
            name = "io.edition.operations.scheduling-enabled",
            havingValue = "true",
            matchIfMissing = true)
    public static class AuditExportJob {
        private final AuditExportWorker rule;

        AuditExportJob(AuditExportWorker rule) {
            this.rule = rule;
        }

        @Scheduled(initialDelay = 5000, fixedDelay = 2000)
        public void work() {
            rule.work();
        }
    }

    @Component
    @ConditionalOnProperty(
            name = "io.edition.operations.scheduling-enabled",
            havingValue = "true",
            matchIfMissing = true)
    public static class AnalyticsRetentionJob {
        private final AnalyticsRetention rule;

        AnalyticsRetentionJob(AnalyticsRetention rule) {
            this.rule = rule;
        }

        @Scheduled(initialDelay = 60000, fixedDelay = 86400000)
        public void retain() {
            rule.retain();
        }
    }

    @Component
    @ConditionalOnProperty(
            name = "io.edition.operations.scheduling-enabled",
            havingValue = "true",
            matchIfMissing = true)
    public static class AuditRetentionJob {
        private final AuditRetention rule;

        AuditRetentionJob(AuditRetention rule) {
            this.rule = rule;
        }

        @Scheduled(initialDelay = 60000, fixedDelay = 3600000)
        public void retain() {
            rule.retain();
        }
    }
}
