package io.edition.control.compositions.releases.bundleimport;

import static io.edition.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.edition.concepts.release.api.ReleaseApi;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class BundleImportRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    BundleImportRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public void promoteOnApprove(ReleaseApi.ReleaseId rel) {
        var completion = io.edition.control.compositions.flow.RuleCompletion.<Void>create();
        completion.dispatch(events, new BundleImportSignals.PromoteOnApprove(rel, completion));
    }
}
