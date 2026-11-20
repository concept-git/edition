package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
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
        var completion = io.space.control.compositions.flow.RuleCompletion.<Void>create();
        completion.dispatch(events, new PageEditingSignals.HotfixAutoPromote(tenant, space, page, actorId, completion));
    }

    public BatchPages batchGetPages(String credential, UUID tenant, UUID space, List<UUID> ids, ReadView view) {
        var completion = io.space.control.compositions.flow.RuleCompletion.<BatchPages>create();
        return completion.dispatch(
                events, new PageEditingSignals.BatchGetPages(credential, tenant, space, ids, view, completion));
    }

    public PageApi.View editAndRecord(
            UUID page,
            String content,
            int baseRevision,
            Resolution resolution,
            String note,
            io.space.content.ContentProfile profile) {
        var completion = io.space.control.compositions.flow.RuleCompletion.<PageApi.View>create();
        return completion.dispatch(
                events,
                new PageEditingSignals.EditAndRecord(
                        page, content, baseRevision, resolution, note, profile, completion));
    }
}
