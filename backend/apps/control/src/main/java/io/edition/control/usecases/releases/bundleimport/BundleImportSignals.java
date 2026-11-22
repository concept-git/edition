package io.edition.control.usecases.releases.bundleimport;

import static io.edition.control.usecases.releases.bundleimport.BundleImportTypes.*;

import io.edition.control.modules.release.api.ReleaseApi;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class BundleImportSignals {
    private BundleImportSignals() {}

    public record PromoteOnApprove(
            ReleaseApi.ReleaseId rel, io.edition.control.usecases.flow.RuleCompletion<Void> completion) {
        @Override
        public String toString() {
            return "PromoteOnApprove[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
