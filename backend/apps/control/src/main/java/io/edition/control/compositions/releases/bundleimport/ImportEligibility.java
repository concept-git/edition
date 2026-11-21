package io.edition.control.compositions.releases.bundleimport;

import static io.edition.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.edition.concepts.importjob.api.ImportJobApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.DriftFacts;
import io.edition.control.compositions.resource.SpaceModeRestrictedException;
import java.util.UUID;

/** Shared entry policy or read projection; no independent causal invocation. */
@org.springframework.stereotype.Component
final class ImportEligibility {
    private final io.edition.control.compositions.resource.ResourceWriteLocks locks;
    private final ImportJobApi jobs;
    private final AuthoringWrites authoringWrites;
    private final DriftFacts drift;

    ImportEligibility(
            io.edition.control.compositions.resource.ResourceWriteLocks locks,
            ImportJobApi jobs,
            AuthoringWrites authoringWrites,
            DriftFacts drift) {
        this.locks = locks;
        this.jobs = jobs;
        this.authoringWrites = authoringWrites;
        this.drift = drift;
    }

    void lockImportableSpace(UUID tenant, UUID space) {
        if (!jobs.tryAdvisoryLock(space)) throw new ImportInProgressException();
        requireImportable(locks.space(tenant, space), space);
    }

    void requireImportable(SpaceApi.View owner, UUID space) {
        authoringWrites.requireActive(owner);
        if (owner.mode() != SpaceApi.Mode.SYNCED) throw new SpaceModeRestrictedException();
        if (drift.hasFlaggedImport(space)) throw new ImportBlockedException();
        if (jobs.hasUnfinished(space)) throw new ImportInProgressException();
    }
}
