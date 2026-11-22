package io.edition.control.usecases.releases.release;

import static io.edition.control.usecases.releases.release.ReleaseTypes.*;

import io.edition.control.usecases.flow.FlowResponse;
import java.util.List;
import java.util.UUID;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class ReleaseSignals {
    private ReleaseSignals() {}

    public record SelectPages(
            String credential,
            UUID tenant,
            UUID space,
            List<UUID> ids,
            String key,
            boolean publish,
            io.edition.control.usecases.flow.RuleCompletion<FlowResponse<BatchPublishResult>> completion) {
        @Override
        public String toString() {
            return "SelectPages[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
