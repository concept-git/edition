package io.edition.control.usecases.releases.release;

import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** authored 空间的内容或目录动作完成后，按 autoRelease 策略在同事务内发版。 */
@Component
public class AuthoredAutoRelease {
    private final TenantAccess tenants;
    private final ReleasePipeline pipeline;

    AuthoredAutoRelease(TenantAccess tenants, ReleasePipeline pipeline) {
        this.tenants = tenants;
        this.pipeline = pipeline;
    }

    @Transactional
    public ReleaseTypes.PipelineResult afterCompletion(
            UUID tenant, SpaceApi.View space, UUID actorId, String sourceRef) {
        if (space.status() != SpaceApi.Status.ACTIVE
                || space.mode() != SpaceApi.Mode.AUTHORED
                || !space.autoRelease()) {
            return new ReleaseTypes.PipelineResult(ReleaseTypes.Outcome.UNCHANGED, null);
        }
        return tenants.inTenant(tenant, () -> pipeline.run(space.id(), actorId, sourceRef));
    }
}
