package io.edition.control.usecases.authoring.tocediting;

import static io.edition.control.usecases.authoring.tocediting.TocEditingTypes.*;

import io.edition.control.modules.toc.api.TocApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class MoveEntryUseCase {
    private final TocApi toc;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final TocAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final TocLivePromotion live;

    MoveEntryUseCase(TocEditingDependencies dependencies) {
        this.toc = dependencies.toc;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.live = dependencies.live;
    }

    @Transactional
    public FlowResponse<TocView> moveEntry(
            String credential, UUID tenant, UUID space, UUID entryId, UUID parentId, int position, String key) {
        resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        Resolution resolution = access.require(credential, tenant, space, TenantAccess.WRITE);
        return idempotency.execute(
                resolution.principal(),
                key,
                "toc.moveEntry",
                IdempotentFlowExecutor.canonical(tenant, space, entryId, parentId, position),
                200,
                TocView.class,
                () -> authoringWrites.withSpaceWrite(tenant, space, owner -> {
                    if (!access.entryBelongs(tenant, space, entryId)) {
                        throw new TocEntryNotFoundException();
                    }

                    TocApi.MoveResult result = toc.move(
                            new TocApi.EntryId(entryId),
                            parentId == null ? null : new TocApi.EntryId(parentId),
                            position);
                    TocView view =
                            switch (result) {
                                case TocApi.MoveResult.Moved moved ->
                                    TocProjection.view(moved.tree(), resolution, tenant, owner, access);
                                case TocApi.MoveResult.DepthExceeded ignored -> throw new DepthExceededException();
                                case TocApi.MoveResult.CycleDetected ignored -> throw new CycleDetectedException();
                                case TocApi.MoveResult.PositionInvalid ignored -> throw new PositionInvalidException();
                                case TocApi.MoveResult.NotFound ignored -> throw new TocEntryNotFoundException();
                            };
                    live.afterMutation(tenant, owner, resolution);
                    return view;
                }));
    }
}
