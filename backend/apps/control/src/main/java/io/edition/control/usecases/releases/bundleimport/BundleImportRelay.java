package io.edition.control.usecases.releases.bundleimport;

import static io.edition.control.usecases.releases.bundleimport.BundleImportTypes.*;

import io.edition.control.modules.release.api.ReleaseApi;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class BundleImportRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    BundleImportRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public void promoteOnApprove(ReleaseApi.ReleaseId rel) {
        var completion = io.edition.control.usecases.flow.RuleCompletion.<Void>create();
        completion.dispatch(events, new BundleImportSignals.PromoteOnApprove(rel, completion));
    }
}
