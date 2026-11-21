package io.edition.control.compositions.releases.release;

import static io.edition.control.compositions.releases.release.ReleaseTypes.*;

import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PromoteReleaseUseCase {

    private final ReleaseApi releases;
    private final TenantAccess tenants;
    private final AuthoringWrites authoringWrites;

    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    private final IdempotentFlowExecutor idempotency;

    PromoteReleaseUseCase(ReleaseDependencies dependencies) {
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<ReleaseDetail> promoteRelease(
            String credential, UUID tenant, UUID space, UUID releaseId, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.PUBLISH);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "release.promote",
                    IdempotentFlowExecutor.canonical(tenant, space, releaseId),
                    200,
                    ReleaseDetail.class,
                    () -> tenants.inTenant(tenant, () -> {
                        authoringWrites.requireActive(access.lockSpace(tenant, space));
                        access.requirePromotable(access.requireRelease(space, releaseId));
                        var changed = (ReleaseApi.MutationResult.Changed)
                                releases.promote(new ReleaseApi.ReleaseId(releaseId));
                        releases.prune(new ReleaseApi.ScopeId(space));
                        return projection.detail(changed.release(), resolution, tenant, owner);
                    }));
        }
    }
}
