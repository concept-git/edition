package io.edition.control.compositions.authoring.space;

import static io.edition.control.compositions.authoring.space.SpaceTypes.*;

import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceArchivedException;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class UpdateSpaceUseCase {
    private final SpaceAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final SpaceApi spaces;

    private final IdempotentFlowExecutor idempotency;
    private final SpaceProjection projection;

    UpdateSpaceUseCase(SpaceDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.spaces = dependencies.spaces;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<SpaceDetail> updateSpace(
            String credential, UUID tenant, UUID space, UpdatePatch patch, String key) {
        SpaceApi.View existing = resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
        var normalized = SpacePatch.normalize(patch, existing.status());
        SpaceApi.ActorId actor = access.actor(resolution);
        return idempotency.execute(
                resolution.principal(),
                key,
                "space.update",
                IdempotentFlowExecutor.canonical(tenant, space, SpacePatch.canonical(normalized)),
                200,
                SpaceDetail.class,
                () -> tenants.inTenant(tenant, () -> {
                    SpaceApi.View current =
                            spaces.lock(new SpaceApi.SpaceId(space)).orElseThrow(SpaceNotFoundException::new);
                    if (current.status() == SpaceApi.Status.ARCHIVED) throw new SpaceArchivedException();
                    if (normalized.autoRelease().isPresent() && current.mode() != SpaceApi.Mode.AUTHORED) {
                        throw new io.edition.control.compositions.resource.SpaceModeRestrictedException();
                    }
                    if (normalized.name() instanceof SpaceApi.Patch.Set<String> set) {
                        current = SpaceResults.changed(
                                SpacePatch.rename(spaces, actor, new SpaceApi.SpaceId(space), set.value()));
                    }
                    if (!(normalized.icon() instanceof SpaceApi.Patch.Unchanged<?>)
                            || !(normalized.description() instanceof SpaceApi.Patch.Unchanged<?>)) {
                        current = SpaceResults.changed(spaces.describe(
                                actor, new SpaceApi.SpaceId(space), normalized.icon(), normalized.description()));
                    }
                    if (normalized.autoRelease().isPresent()) {
                        current = SpaceResults.changed(spaces.setAutoRelease(
                                actor,
                                new SpaceApi.SpaceId(space),
                                normalized.autoRelease().orElseThrow()));
                    }
                    return projection.detail(current, resolution, tenant);
                }));
    }
}
