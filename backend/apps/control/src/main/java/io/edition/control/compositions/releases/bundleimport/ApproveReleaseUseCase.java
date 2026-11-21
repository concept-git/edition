package io.edition.control.compositions.releases.bundleimport;

import static io.edition.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.DriftFacts;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.releases.release.ReleaseAccess;
import io.edition.control.compositions.releases.release.ReleaseNotFoundException;
import io.edition.control.compositions.releases.release.ReleaseProjection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ApproveReleaseUseCase {
    private final BundleImportRelay relay;

    private final io.edition.control.compositions.resource.ResourceWriteLocks locks;

    private final io.edition.concepts.deletionrecovery.api.DeletionRecoveryApi operations;
    private final ReleaseApi releases;

    private final TenantAccess tenants;
    private final AuthoringWrites authoringWrites;
    private final ReleaseAccess access;
    private final ReleaseProjection projection;
    private final IdempotentFlowExecutor idempotency;

    private final DriftFacts drift;
    private final ImportedWorkspaceMirror mirror;

    ApproveReleaseUseCase(BundleImportDependencies dependencies) {
        this.relay = dependencies.relay;
        this.locks = dependencies.locks;
        this.operations = dependencies.operations;
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
        this.drift = dependencies.drift;
        this.mirror = dependencies.mirror;
    }

    @Transactional
    public FlowResponse<ApproveResult> approveRelease(
            String credential, UUID tenant, UUID space, UUID releaseId, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.PUBLISH);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "release.approve",
                    IdempotentFlowExecutor.canonical(releaseId, "flagged"),
                    200,
                    ApproveResult.class,
                    () -> tenants.inTenant(tenant, () -> {
                        operations.lockSpace(space);
                        authoringWrites.requireActive(locks.space(tenant, space));
                        ReleaseApi.View existing = access.requireRelease(space, releaseId);
                        if (existing.status() != ReleaseApi.Status.FLAGGED
                                || existing.source().kind() != ReleaseApi.SourceKind.IMPORT) {
                            throw new ReleaseNotFlaggedException();
                        }
                        var previousImport = drift.lastPromotedImport(space);
                        releases.approve(new ReleaseApi.ReleaseId(releaseId));
                        relay.promoteOnApprove(new ReleaseApi.ReleaseId(releaseId));
                        ReleaseApi.Bundle bundle = releases.export(new ReleaseApi.ReleaseId(releaseId))
                                .orElseThrow(ReleaseNotFoundException::new);
                        Set<UUID> keep = bundle.pages().stream()
                                .map(ReleaseApi.PageSnapshot::pageId)
                                .collect(Collectors.toUnmodifiableSet());
                        HashSet<UUID> trash = new HashSet<>();
                        previousImport.ifPresent(last -> {
                            for (ReleaseApi.PageSnapshot page : last.pages()) {
                                if (!keep.contains(page.pageId())) trash.add(page.pageId());
                            }
                        });
                        mirror.mirrorReleaseIntoWorkspace(space, bundle, Set.copyOf(trash));
                        ReleaseApi.View live = access.requireRelease(space, releaseId);
                        return new ApproveResult("promoted", projection.detail(live, resolution, tenant, owner));
                    }));
        }
    }
}
