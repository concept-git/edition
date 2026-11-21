package io.edition.control.compositions.platform.operations;

import io.edition.concepts.importjob.api.ImportJobApi;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
final class OperationsMetrics {
    OperationsMetrics(ImportJobApi jobs, MeterRegistry metrics) {
        io.micrometer.core.instrument.Timer.builder("edition.release.promote")
                .description("Release promotion action duration; asynchronous delivery is separate")
                .publishPercentiles(0.5, 0.99)
                .publishPercentileHistogram()
                .register(metrics);
        metrics.counter("edition.webhook.deliveries", "outcome", "ok");
        metrics.counter("edition.webhook.deliveries", "outcome", "failed");
        Gauge.builder("edition.import.queue.depth", jobs, ImportJobApi::queueDepth)
                .description("Durable queued or retrying import jobs across tenants; metadata only")
                .register(metrics);
    }
}
