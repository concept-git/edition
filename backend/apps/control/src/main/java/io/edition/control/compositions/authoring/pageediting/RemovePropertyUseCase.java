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
public class RemovePropertyUseCase {

    private final PageApi pages;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final PageAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;

    RemovePropertyUseCase(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<PageDetail> removeProperty(
            String credential, UUID tenant, UUID space, UUID page, String field, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
            var resolution = access.require(credential, tenant, space, page, TenantAccess.WRITE);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.property.remove",
                    IdempotentFlowExecutor.canonical(tenant, space, page, field.strip()),
                    200,
                    PageDetail.class,
                    () -> authoringWrites.withWorkingWrite(
                            tenant,
                            space,
                            page,
                            false,
                            located -> projection.detail(
                                    PageMetadataResults.changed(pages.removeProperty(
                                            new PageApi.PageId(page), field, access.pageActor(resolution))),
                                    located.slug(),
                                    resolution,
                                    tenant,
                                    located.space())));
        }
    }
}
