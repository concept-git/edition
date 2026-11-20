package io.space.control.entry.http.problem;

import io.micrometer.tracing.Tracer;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

/** 从当前 OpenTelemetry span 取得 traceId；测试或未启用 tracing 时退回 requestId。 */
@Component
final class RequestTrace {

    private final ObjectProvider<Tracer> tracer;

    RequestTrace(ObjectProvider<Tracer> tracer) {
        this.tracer = tracer;
    }

    String traceId(HttpServletRequest request) {
        var activeTracer = tracer.getIfAvailable();
        var span = activeTracer == null ? null : activeTracer.currentSpan();
        return span == null ? RequestIds.requestId(request) : span.context().traceId();
    }
}
