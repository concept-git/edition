package io.edition.control.compositions.releases.release;

import static io.edition.control.compositions.releases.release.ReleaseTypes.*;

import io.edition.control.compositions.flow.FlowResponse;
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
            io.edition.control.compositions.flow.RuleCompletion<FlowResponse<BatchPublishResult>> completion) {
        @Override
        public String toString() {
            return "SelectPages[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
