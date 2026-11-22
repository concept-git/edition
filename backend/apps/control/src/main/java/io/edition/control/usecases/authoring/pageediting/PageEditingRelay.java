package io.edition.control.usecases.authoring.pageediting;

import static io.edition.control.usecases.authoring.pageediting.PageEditingTypes.*;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.UUID;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class PageEditingRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    PageEditingRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public void hotfixAutoPromote(UUID tenant, SpaceApi.View space, PageApi.View page, UUID actorId) {
        var completion = io.edition.control.usecases.flow.RuleCompletion.<Void>create();
        completion.dispatch(events, new PageEditingSignals.HotfixAutoPromote(tenant, space, page, actorId, completion));
    }

    public BatchPages batchGetPages(String credential, UUID tenant, UUID space, List<UUID> ids, ReadView view) {
        var completion = io.edition.control.usecases.flow.RuleCompletion.<BatchPages>create();
        return completion.dispatch(
                events, new PageEditingSignals.BatchGetPages(credential, tenant, space, ids, view, completion));
    }

    public PageApi.View editAndRecord(
            UUID page,
            String content,
            int baseRevision,
            Resolution resolution,
            String note,
            io.edition.content.ContentProfile profile) {
        var completion = io.edition.control.usecases.flow.RuleCompletion.<PageApi.View>create();
        return completion.dispatch(
                events,
                new PageEditingSignals.EditAndRecord(
                        page, content, baseRevision, resolution, note, profile, completion));
    }
}
