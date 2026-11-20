package io.space.control.compositions.authoring.tocediting;

import static io.space.control.compositions.authoring.tocediting.TocEditingTypes.*;

import io.space.concepts.toc.api.TocApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RemoveEntryUseCase {
    private final TocApi toc;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final TocAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final TocLivePromotion live;

    RemoveEntryUseCase(TocEditingDependencies dependencies) {
        this.toc = dependencies.toc;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.live = dependencies.live;
    }

    @Transactional
    public FlowResponse<TocView> removeEntry(String credential, UUID tenant, UUID space, UUID entryId, String key) {
        resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        Resolution resolution = access.require(credential, tenant, space, TenantAccess.WRITE);
        return idempotency.execute(
                resolution.principal(),
                key,
                "toc.removeEntry",
                IdempotentFlowExecutor.canonical(tenant, space, entryId),
                200,
                TocView.class,
                () -> authoringWrites.withSpaceWrite(tenant, space, owner -> {
                    if (!access.entryBelongs(tenant, space, entryId)) {
                        throw new TocEntryNotFoundException();
                    }

                    TocApi.RemoveResult result = toc.remove(new TocApi.EntryId(entryId));
                    TocView view =
                            switch (result) {
                                case TocApi.RemoveResult.Removed removed ->
                                    TocProjection.view(removed.tree(), resolution, tenant, owner, access);
                                case TocApi.RemoveResult.NotFound ignored -> throw new TocEntryNotFoundException();
                            };
                    live.afterMutation(tenant, owner, resolution);
                    return view;
                }));
    }
}
