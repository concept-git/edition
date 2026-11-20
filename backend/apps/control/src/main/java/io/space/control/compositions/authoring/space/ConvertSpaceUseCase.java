package io.space.control.compositions.authoring.space;

import static io.space.control.compositions.authoring.space.SpaceTypes.*;

import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceArchivedException;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ConvertSpaceUseCase {
    private final SpaceAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final SpaceApi spaces;
    private final ReleaseApi releases;
    private final IdempotentFlowExecutor idempotency;
    private final SpaceProjection projection;

    ConvertSpaceUseCase(SpaceDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.spaces = dependencies.spaces;
        this.releases = dependencies.releases;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<SpaceDetail> convertSpace(String credential, UUID tenant, UUID space, String mode, String key) {
        SpaceApi.View existing = resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
        var parsedMode = SpacePatch.mode(mode);
        SpaceApi.ActorId actor = access.actor(resolution);
        return idempotency.execute(
                resolution.principal(),
                key,
                "space.convert",
                IdempotentFlowExecutor.canonical(tenant, space, parsedMode.name()),
                200,
                SpaceDetail.class,
                () -> tenants.inTenant(tenant, () -> {
                    var current = spaces.lock(new SpaceApi.SpaceId(space)).orElseThrow(SpaceNotFoundException::new);
                    if (current.status() == SpaceApi.Status.ARCHIVED) throw new SpaceArchivedException();
                    if (current.mode() == SpaceApi.Mode.AUTHORED
                            && parsedMode == SpaceApi.Mode.SYNCED
                            && releases.live(new ReleaseApi.ScopeId(space)).isEmpty())
                        throw new LiveReleaseRequiredException();
                    return projection.detail(
                            SpaceResults.changed(spaces.convert(actor, new SpaceApi.SpaceId(space), parsedMode)),
                            resolution,
                            tenant);
                }));
    }
}
