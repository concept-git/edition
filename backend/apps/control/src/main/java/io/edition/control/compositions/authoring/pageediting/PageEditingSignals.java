package io.edition.control.compositions.authoring.pageediting;

import static io.edition.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.UUID;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class PageEditingSignals {
    private PageEditingSignals() {}

    public record HotfixAutoPromote(
            UUID tenant,
            SpaceApi.View space,
            PageApi.View page,
            UUID actorId,
            io.edition.control.compositions.flow.RuleCompletion<Void> completion) {
        @Override
        public String toString() {
            return "HotfixAutoPromote[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }

    public record BatchGetPages(
            String credential,
            UUID tenant,
            UUID space,
            List<UUID> ids,
            ReadView view,
            io.edition.control.compositions.flow.RuleCompletion<BatchPages> completion) {
        @Override
        public String toString() {
            return "BatchGetPages[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }

    public record EditAndRecord(
            UUID page,
            String content,
            int baseRevision,
            Resolution resolution,
            String note,
            io.edition.content.ContentProfile profile,
            io.edition.control.compositions.flow.RuleCompletion<PageApi.View> completion) {
        @Override
        public String toString() {
            return "EditAndRecord[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
