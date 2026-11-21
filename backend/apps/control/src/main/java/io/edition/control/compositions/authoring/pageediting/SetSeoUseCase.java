package io.edition.control.compositions.authoring.pageediting;

import static io.edition.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.edition.concepts.page.api.PageApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.PageNotFoundException;
import io.edition.control.compositions.resource.ResourceChain;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SetSeoUseCase {

    private final PageApi pages;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final PageAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;

    SetSeoUseCase(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<PageDetail> setSeo(
            String credential, UUID tenant, UUID space, UUID page, SeoPatch patch, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
            var resolution = access.require(credential, tenant, space, page, TenantAccess.WRITE);
            if (patch.isEmpty()) throw new MetadataInvalidException("seo", "empty_patch");
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.seo",
                    IdempotentFlowExecutor.canonical(tenant, space, page, patch.canonical()),
                    200,
                    PageDetail.class,
                    () -> authoringWrites.withWorkingWrite(
                            tenant,
                            space,
                            page,
                            false,
                            located -> projection.detail(
                                    PageMetadataResults.changed(pages.setSeo(
                                            new PageApi.PageId(page), patch.toConcept(), access.pageActor(resolution))),
                                    located.slug(),
                                    resolution,
                                    tenant,
                                    located.space())));
        }
    }
}
