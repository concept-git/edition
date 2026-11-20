package io.space.control.compositions.releases.release;

import static io.space.control.compositions.releases.release.ReleaseTypes.*;

import io.space.control.compositions.flow.FlowResponse;
import java.util.List;
import java.util.UUID;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class ReleaseRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    ReleaseRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public FlowResponse<BatchPublishResult> selectPages(
            String credential, UUID tenant, UUID space, List<UUID> ids, String key, boolean publish) {
        var completion = io.space.control.compositions.flow.RuleCompletion.<FlowResponse<BatchPublishResult>>create();
        return completion.dispatch(
                events, new ReleaseSignals.SelectPages(credential, tenant, space, ids, key, publish, completion));
    }
}
