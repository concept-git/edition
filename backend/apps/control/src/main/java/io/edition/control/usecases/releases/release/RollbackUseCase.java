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
public class RollbackUseCase {

    private final ReleaseApi releases;
    private final TenantAccess tenants;
    private final AuthoringWrites authoringWrites;

    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    private final IdempotentFlowExecutor idempotency;

    RollbackUseCase(ReleaseDependencies dependencies) {
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<ReleaseDetail> rollback(
            String credential, UUID tenant, UUID space, UUID releaseId, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.PUBLISH);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "release.rollback",
                    IdempotentFlowExecutor.canonical(tenant, space, releaseId),
                    200,
                    ReleaseDetail.class,
                    () -> tenants.inTenant(tenant, () -> {
                        authoringWrites.requireActive(access.lockSpace(tenant, space));
                        access.requireArchived(access.requireRelease(space, releaseId));
                        var changed = (ReleaseApi.MutationResult.Changed)
                                releases.promote(new ReleaseApi.ReleaseId(releaseId));
                        releases.prune(new ReleaseApi.ScopeId(space));
                        return projection.detail(changed.release(), resolution, tenant, owner);
                    }));
        }
    }
}
