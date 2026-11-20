package io.space.control.compositions.authoring.space;

import static io.space.control.compositions.authoring.space.SpaceTypes.*;

import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ArchiveSpaceUseCase {
    private final SpaceAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final SpaceApi spaces;

    private final IdempotentFlowExecutor idempotency;
    private final SpaceProjection projection;

    ArchiveSpaceUseCase(SpaceDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.spaces = dependencies.spaces;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<SpaceDetail> archiveSpace(String credential, UUID tenant, UUID space, String key) {
        SpaceApi.View existing = resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
        SpaceApi.ActorId actor = access.actor(resolution);
        return idempotency.execute(
                resolution.principal(),
                key,
                "space.archive",
                IdempotentFlowExecutor.canonical(tenant, space),
                200,
                SpaceDetail.class,
                () -> tenants.inTenant(
                        tenant,
                        () -> projection.detail(
                                SpaceResults.found(spaces.archive(actor, new SpaceApi.SpaceId(space))),
                                resolution,
                                tenant)));
    }
}
