package io.space.control.compositions.hosting.reorganization;

import static io.space.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.space.concepts.redirect.api.RedirectApi;
import java.util.List;
import java.util.UUID;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class ReorganizationRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    ReorganizationRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public RedirectApi.Rule redirectOnRemount(UUID site, String oldSlug, UUID space) {
        var completion = io.space.control.compositions.flow.RuleCompletion.<RedirectApi.Rule>create();
        return completion.dispatch(
                events, new ReorganizationSignals.RedirectOnRemount(site, oldSlug, space, completion));
    }

    public List<RedirectApi.Rule> redirectOnReslug(UUID oldSpace, String oldPageSlug, UUID page) {
        var completion = io.space.control.compositions.flow.RuleCompletion.<List<RedirectApi.Rule>>create();
        return completion.dispatch(
                events, new ReorganizationSignals.RedirectOnReslug(oldSpace, oldPageSlug, page, completion));
    }
}
