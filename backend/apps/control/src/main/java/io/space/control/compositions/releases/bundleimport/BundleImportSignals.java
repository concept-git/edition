package io.space.control.compositions.releases.bundleimport;

import static io.space.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.space.concepts.release.api.ReleaseApi;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class BundleImportSignals {
    private BundleImportSignals() {}

    public record PromoteOnApprove(
            ReleaseApi.ReleaseId rel, io.space.control.compositions.flow.RuleCompletion<Void> completion) {
        @Override
        public String toString() {
            return "PromoteOnApprove[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
