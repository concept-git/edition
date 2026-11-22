package io.edition.control.usecases.releases.bundleimport;

import static io.edition.control.usecases.releases.bundleimport.BundleImportTypes.*;

import io.edition.control.modules.release.api.ReleaseApi;

@org.springframework.stereotype.Service
public class PromoteOnApprove {

    private final ReleaseApi releases;

    PromoteOnApprove(BundleImportDependencies dependencies) {
        this.releases = dependencies.releases;
    }

    void promoteOnApprove(ReleaseApi.ReleaseId rel) {
        var changed = (ReleaseApi.MutationResult.Changed) releases.promote(rel);
        releases.prune(new ReleaseApi.ScopeId(changed.release().scopeId()));
    }

    @org.springframework.context.event.EventListener
    public void promoteOnApprove(BundleImportSignals.PromoteOnApprove binding) {
        if (!binding.completion().claim("promoteOnApprove")) return;
        promoteOnApprove(binding.rel());
        binding.completion().complete(null);
    }
}
