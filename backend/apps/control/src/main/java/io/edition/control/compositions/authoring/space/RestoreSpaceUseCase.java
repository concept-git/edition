package io.edition.control.compositions.authoring.space;

import static io.edition.control.compositions.authoring.space.SpaceTypes.*;

import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RestoreSpaceUseCase {
    private final SpaceAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final SpaceApi spaces;

    private final IdempotentFlowExecutor idempotency;
    private final SpaceProjection projection;

    RestoreSpaceUseCase(SpaceDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.spaces = dependencies.spaces;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<SpaceDetail> restoreSpace(String credential, UUID tenant, UUID space, String key) {
        SpaceApi.View existing = resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
        SpaceApi.ActorId actor = access.actor(resolution);
        return idempotency.execute(
                resolution.principal(),
                key,
                "space.restore",
                IdempotentFlowExecutor.canonical(tenant, space),
                200,
                SpaceDetail.class,
                () -> tenants.inTenant(
                        tenant,
                        () -> projection.detail(
                                SpaceResults.found(spaces.restore(actor, new SpaceApi.SpaceId(space))),
                                resolution,
                                tenant)));
    }
}
