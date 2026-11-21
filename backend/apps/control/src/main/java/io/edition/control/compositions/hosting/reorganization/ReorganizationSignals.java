package io.edition.control.compositions.hosting.reorganization;

import static io.edition.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.edition.concepts.redirect.api.RedirectApi;
import java.util.List;
import java.util.UUID;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class ReorganizationSignals {
    private ReorganizationSignals() {}

    public record RedirectOnRemount(
            UUID site,
            String oldSlug,
            UUID space,
            io.edition.control.compositions.flow.RuleCompletion<RedirectApi.Rule> completion) {
        @Override
        public String toString() {
            return "RedirectOnRemount[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }

    public record RedirectOnReslug(
            UUID oldSpace,
            String oldPageSlug,
            UUID page,
            io.edition.control.compositions.flow.RuleCompletion<List<RedirectApi.Rule>> completion) {
        @Override
        public String toString() {
            return "RedirectOnReslug[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
