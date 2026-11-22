package io.edition.control.usecases.authoring.pageediting;

import static io.edition.control.usecases.authoring.pageediting.PageEditingTypes.*;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.revision.api.RevisionApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.PageNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RevertPageUseCase {
    private final PageEditingRelay relay;

    private final io.edition.control.usecases.resource.ContentTypes contentTypes;
    private final RevisionApi revisions;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final PageAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;

    RevertPageUseCase(PageEditingDependencies dependencies) {
        this.relay = dependencies.relay;
        this.contentTypes = dependencies.contentTypes;
        this.revisions = dependencies.revisions;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<PageDetail> revertPage(
            String credential, UUID tenant, UUID space, UUID page, int targetRevision, int baseRevision, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
            var resolution = access.require(credential, tenant, space, page, TenantAccess.WRITE);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.revert",
                    IdempotentFlowExecutor.canonical(tenant, space, page, targetRevision, baseRevision),
                    200,
                    PageDetail.class,
                    () -> authoringWrites.withWorkingWrite(tenant, space, page, false, located -> {
                        RevisionApi.Detail restored = revisions
                                .detail(new RevisionApi.ItemId(page), targetRevision)
                                .orElseThrow(RevisionNotFoundException::new);
                        PageApi.View edited = relay.editAndRecord(
                                page,
                                restored.content(),
                                baseRevision,
                                resolution,
                                "restored-from:" + targetRevision,
                                contentTypes.restore(
                                        restored.contentProfile() == null
                                                ? io.edition.content.ContentProfile.defaults(
                                                        located.page().format().name())
                                                : restored.contentProfile(),
                                        located.page().contentProfile()));
                        return projection.detail(edited, located.slug(), resolution, tenant, located.space());
                    }));
        }
    }
}
