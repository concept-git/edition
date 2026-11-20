package io.space.control.compositions.hosting.reorganization;

import static io.space.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.space.concepts.redirect.api.RedirectApi;
import java.util.List;
import java.util.UUID;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class ReorganizationSignals {
    private ReorganizationSignals() {}

    public record RedirectOnRemount(
            UUID site,
            String oldSlug,
            UUID space,
            io.space.control.compositions.flow.RuleCompletion<RedirectApi.Rule> completion) {
        @Override
        public String toString() {
            return "RedirectOnRemount[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }

    public record RedirectOnReslug(
            UUID oldSpace,
            String oldPageSlug,
            UUID page,
            io.space.control.compositions.flow.RuleCompletion<List<RedirectApi.Rule>> completion) {
        @Override
        public String toString() {
            return "RedirectOnReslug[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
