package io.edition.control.usecases.releases.release;

import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.usecases.resource.InvalidBundleException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** 共享发版流水线：装载之后的 validate / skip / promote / hold / prune。 */
@Component
class ReleasePipeline {
    private final ReleaseApi releases;
    private final WorkspaceSnapshots snapshots;

    ReleasePipeline(ReleaseApi releases, WorkspaceSnapshots snapshots) {
        this.releases = releases;
        this.snapshots = snapshots;
    }

    ReleaseTypes.PipelineResult run(UUID space, UUID actorId, String sourceRef) {
        WorkspaceSnapshots.Snapshot snapshot = snapshots.collect(space);
        ReleaseApi.ScopeId scope = new ReleaseApi.ScopeId(space);
        ReleaseApi.View drafted =
                releases.draft(scope, new ReleaseApi.Source(ReleaseApi.SourceKind.BUILD, sourceRef, actorId));
        ReleaseApi.ReleaseId id = new ReleaseApi.ReleaseId(drafted.id());
        ReleaseApi.LoadResult loaded = releases.load(id, snapshot.bundle());
        if (loaded instanceof ReleaseApi.LoadResult.InvalidBundle) {
            return loadRejected(id);
        }
        ReleaseApi.ValidateResult validated = autoValidate(id);
        if (validated instanceof ReleaseApi.ValidateResult.Errors errors) {
            return holdOnErrors(errors.release());
        }
        Optional<ReleaseApi.View> live = releases.live(scope);
        boolean diffEmpty = live.isPresent()
                && releases.diff(new ReleaseApi.ReleaseId(live.orElseThrow().id()), id)
                        .map(ReleaseApi.Delta::empty)
                        .orElse(true);
        boolean snapshotUnchanged = live.flatMap(version -> releases.export(new ReleaseApi.ReleaseId(version.id())))
                .map(bundle -> bundle.toc().equals(snapshot.bundle().toc())
                        && bundle.pages().equals(snapshot.bundle().pages()))
                .orElse(false);
        if (ReleaseDecisions.skip(live.isPresent(), snapshot.pageCount(), diffEmpty, snapshotUnchanged)) {
            return skipNoChange(id);
        }
        ReleaseTypes.PipelineResult promoted = autoRelease(id);
        retention(scope);
        return promoted;
    }

    ReleaseTypes.PipelineResult loadRejected(ReleaseApi.ReleaseId rel) {
        releases.discard(rel);
        throw new InvalidBundleException();
    }

    ReleaseApi.ValidateResult autoValidate(ReleaseApi.ReleaseId rel) {
        return releases.validate(rel, List.of());
    }

    ReleaseTypes.PipelineResult skipNoChange(ReleaseApi.ReleaseId rel) {
        releases.discard(rel);
        return new ReleaseTypes.PipelineResult(ReleaseTypes.Outcome.SKIPPED, null);
    }

    ReleaseTypes.PipelineResult autoRelease(ReleaseApi.ReleaseId rel) {
        var changed = (ReleaseApi.MutationResult.Changed) releases.promote(rel);
        return new ReleaseTypes.PipelineResult(ReleaseTypes.Outcome.PROMOTED, changed.release());
    }

    ReleaseTypes.PipelineResult holdOnErrors(ReleaseApi.View release) {
        return new ReleaseTypes.PipelineResult(ReleaseTypes.Outcome.HELD, release);
    }

    void retention(ReleaseApi.ScopeId scope) {
        releases.prune(scope);
    }
}
