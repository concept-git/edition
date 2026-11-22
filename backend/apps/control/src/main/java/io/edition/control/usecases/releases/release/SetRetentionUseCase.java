package io.edition.control.usecases.releases.release;

import static io.edition.control.usecases.releases.release.ReleaseTypes.*;

import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.authoring.space.SpaceProjection;
import io.edition.control.usecases.authoring.space.SpaceTypes;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SetRetentionUseCase {

    private final ReleaseApi releases;
    private final TenantAccess tenants;
    private final AuthoringWrites authoringWrites;

    private final ReleaseAccess access;

    private final IdempotentFlowExecutor idempotency;
    private final SpaceProjection spaceProjection;

    SetRetentionUseCase(ReleaseDependencies dependencies) {
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.spaceProjection = dependencies.spaceProjection;
    }

    @Transactional
    public FlowResponse<SpaceTypes.SpaceDetail> setRetention(
            String credential, UUID tenant, UUID space, int keep, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.ADMIN);
            if (keep < ReleaseApi.MIN_KEEP || keep > ReleaseApi.MAX_KEEP) throw new RetentionInvalidException();
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "release.retention",
                    IdempotentFlowExecutor.canonical(tenant, space, keep),
                    200,
                    SpaceTypes.SpaceDetail.class,
                    () -> {
                        authoringWrites.requireActive(access.lockSpace(tenant, space));
                        tenants.inTenant(tenant, () -> releases.setRetention(new ReleaseApi.ScopeId(space), keep));
                        return spaceProjection.view(credential, tenant, space);
                    });
        }
    }
}
