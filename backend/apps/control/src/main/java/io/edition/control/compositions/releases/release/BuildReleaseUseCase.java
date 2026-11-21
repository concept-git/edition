package io.edition.control.compositions.releases.release;

import static io.edition.control.compositions.releases.release.ReleaseTypes.*;

import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class BuildReleaseUseCase {

    private final TenantAccess tenants;
    private final AuthoringWrites authoringWrites;

    private final ReleaseAccess access;
    private final ReleaseProjection projection;
    private final ReleasePipeline pipeline;

    private final IdempotentFlowExecutor idempotency;

    BuildReleaseUseCase(ReleaseDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.pipeline = dependencies.pipeline;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<BuildResult> buildRelease(String credential, UUID tenant, UUID space, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.PUBLISH);
            UUID actorId = access.actorId(resolution);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "release.build",
                    IdempotentFlowExecutor.canonical(tenant, space),
                    200,
                    BuildResult.class,
                    () -> {
                        authoringWrites.require(access.lockSpace(tenant, space));
                        PipelineResult result = tenants.inTenant(tenant, () -> pipeline.run(space, actorId, "manual"));
                        ReleaseDetail release = result.release() == null
                                ? null
                                : tenants.inTenant(
                                        tenant, () -> projection.detail(result.release(), resolution, tenant, owner));
                        return new BuildResult(result.outcome(), release);
                    });
        }
    }
}
