package io.edition.control.compositions.authoring.tocediting;

import static io.edition.control.compositions.authoring.tocediting.TocEditingTypes.*;

import io.edition.concepts.toc.api.TocApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RelabelEntryUseCase {
    private final TocApi toc;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final TocAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final TocLivePromotion live;

    RelabelEntryUseCase(TocEditingDependencies dependencies) {
        this.toc = dependencies.toc;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.live = dependencies.live;
    }

    @Transactional
    public FlowResponse<TocView> relabelEntry(
            String credential, UUID tenant, UUID space, UUID entryId, String label, String key) {
        resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        Resolution resolution = access.require(credential, tenant, space, TenantAccess.WRITE);
        return idempotency.execute(
                resolution.principal(),
                key,
                "toc.relabelEntry",
                IdempotentFlowExecutor.canonical(tenant, space, entryId, label),
                200,
                TocView.class,
                () -> authoringWrites.withSpaceWrite(tenant, space, owner -> {
                    if (!access.entryBelongs(tenant, space, entryId)) {
                        throw new TocEntryNotFoundException();
                    }

                    TocApi.RelabelResult result = toc.relabel(new TocApi.EntryId(entryId), label);
                    TocView view =
                            switch (result) {
                                case TocApi.RelabelResult.Relabeled relabeled ->
                                    TocProjection.view(relabeled.tree(), resolution, tenant, owner, access);
                                case TocApi.RelabelResult.NotFound ignored -> throw new TocEntryNotFoundException();
                                case TocApi.RelabelResult.Invalid invalid ->
                                    throw new TocInvalidException(invalid.field(), invalid.code());
                            };
                    live.afterMutation(tenant, owner, resolution);
                    return view;
                }));
    }
}
