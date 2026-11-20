package io.space.control.compositions.authoring.space;

import static io.space.control.compositions.authoring.space.SpaceTypes.*;

import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class CreateSpaceUseCase {
    private final SpaceAccess access;
    private final TenantAccess tenants;

    private final SpaceApi spaces;

    private final IdempotentFlowExecutor idempotency;
    private final SpaceProjection projection;

    CreateSpaceUseCase(SpaceDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.spaces = dependencies.spaces;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<SpaceDetail> createSpace(String credential, UUID tenant, String name, String mode, String key) {
        Resolution resolution = access.requireTenantAdmin(credential, tenant);
        SpaceApi.ActorId actor = access.actor(resolution);
        var parsedMode = SpacePatch.mode(mode);
        return idempotency.execute(
                resolution.principal(),
                key,
                "space.create",
                IdempotentFlowExecutor.canonical(tenant, name.strip(), parsedMode.name()),
                201,
                SpaceDetail.class,
                () -> tenants.inTenant(
                        tenant,
                        () -> projection.detail(
                                SpacePatch.create(spaces, actor, tenant, name, parsedMode), resolution, tenant)));
    }
}
