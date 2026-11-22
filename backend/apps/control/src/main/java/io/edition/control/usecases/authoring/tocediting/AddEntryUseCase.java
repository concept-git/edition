package io.edition.control.usecases.authoring.tocediting;

import static io.edition.control.usecases.authoring.tocediting.TocEditingTypes.*;

import io.edition.control.modules.toc.api.TocApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.PageNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class AddEntryUseCase {
    private final TocApi toc;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final TocAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final TocLivePromotion live;

    AddEntryUseCase(TocEditingDependencies dependencies) {
        this.toc = dependencies.toc;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.live = dependencies.live;
    }

    @Transactional
    public FlowResponse<TocView> addEntry(
            String credential,
            UUID tenant,
            UUID space,
            UUID parentId,
            String label,
            String kind,
            UUID targetId,
            String url,
            Integer position,
            String key) {
        resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        Resolution resolution = access.require(credential, tenant, space, TenantAccess.WRITE);
        TocApi.Kind parsedKind = TocKinds.parse(kind);
        return idempotency.execute(
                resolution.principal(),
                key,
                "toc.addEntry",
                IdempotentFlowExecutor.canonical(tenant, space, parentId, label, kind, targetId, url, position),
                201,
                TocView.class,
                () -> authoringWrites.withSpaceWrite(tenant, space, owner -> {
                    if (parsedKind == TocApi.Kind.TARGET) {
                        if (targetId == null) throw new TocInvalidException("targetId", "required");
                        var target = resources.page(tenant, space, targetId);
                        if (target.isEmpty() || target.orElseThrow().page().trashedAt() != null) {
                            throw new PageNotFoundException();
                        }
                    }

                    TocApi.AddResult result = toc.addEntry(
                            new TocApi.TocId(space),
                            parentId == null ? null : new TocApi.EntryId(parentId),
                            label,
                            parsedKind,
                            targetId,
                            url,
                            position);
                    TocView view =
                            switch (result) {
                                case TocApi.AddResult.Added ignored ->
                                    TocProjection.view(
                                            toc.tree(new TocApi.TocId(space)), resolution, tenant, owner, access);
                                case TocApi.AddResult.DepthExceeded ignored -> throw new DepthExceededException();
                                case TocApi.AddResult.PositionInvalid ignored -> throw new PositionInvalidException();
                                case TocApi.AddResult.ParentNotFound ignored -> throw new TocEntryNotFoundException();
                                case TocApi.AddResult.Invalid invalid ->
                                    throw new TocInvalidException(invalid.field(), invalid.code());
                            };
                    live.afterMutation(tenant, owner, resolution);
                    return view;
                }));
    }
}
