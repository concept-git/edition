package io.edition.control.usecases.releases.release;

import static io.edition.control.usecases.releases.release.ReleaseTypes.*;

import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PatchReleaseUseCase {

    private final ReleaseApi releases;
    private final TenantAccess tenants;
    private final AuthoringWrites authoringWrites;

    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    private final IdempotentFlowExecutor idempotency;

    PatchReleaseUseCase(ReleaseDependencies dependencies) {
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<ReleaseDetail> patchRelease(
            String credential, UUID tenant, UUID space, UUID releaseId, ReleasePatch patch, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.ADMIN);
            if (patch == null || patch.empty()) throw new ReleasePatchInvalidException();
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "release.patch",
                    IdempotentFlowExecutor.canonical(tenant, space, releaseId, patch.canonical()),
                    200,
                    ReleaseDetail.class,
                    () -> tenants.inTenant(tenant, () -> {
                        authoringWrites.requireActive(access.lockSpace(tenant, space));
                        ReleaseApi.View current = access.requireRelease(space, releaseId);
                        if (patch.labelPresent()) {
                            try {
                                var changed = (ReleaseApi.MutationResult.Changed)
                                        releases.setLabel(new ReleaseApi.ReleaseId(releaseId), patch.label());
                                current = changed.release();
                            } catch (IllegalArgumentException invalid) {
                                throw new ReleasePatchInvalidException("label", "size_out_of_range");
                            }
                        }
                        if (patch.notesPresent()) {
                            var changed = (ReleaseApi.MutationResult.Changed)
                                    releases.annotate(new ReleaseApi.ReleaseId(releaseId), patch.notes());
                            current = changed.release();
                        }
                        return projection.detail(current, resolution, tenant, owner);
                    }));
        }
    }
}
