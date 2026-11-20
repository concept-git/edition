package io.space.control.compositions.platform.operations;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.space.concepts.importjob.api.ImportJobApi;
import org.springframework.stereotype.Component;

@Component
final class OperationsMetrics {
    OperationsMetrics(ImportJobApi jobs, MeterRegistry metrics) {
        io.micrometer.core.instrument.Timer.builder("space.release.promote")
                .description("Release promotion action duration; asynchronous delivery is separate")
                .publishPercentiles(0.5, 0.99)
                .publishPercentileHistogram()
                .register(metrics);
        metrics.counter("space.webhook.deliveries", "outcome", "ok");
        metrics.counter("space.webhook.deliveries", "outcome", "failed");
        Gauge.builder("space.import.queue.depth", jobs, ImportJobApi::queueDepth)
                .description("Durable queued or retrying import jobs across tenants; metadata only")
                .register(metrics);
    }
}
