package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.PageNotFoundException;
import io.space.control.compositions.resource.ResourceChain;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SetPropertyUseCase {

    private final PageApi pages;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final PageAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;

    SetPropertyUseCase(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<PageDetail> setProperty(
            String credential, UUID tenant, UUID space, UUID page, String field, String value, String key) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
            var resolution = access.require(credential, tenant, space, page, TenantAccess.WRITE);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.property.set",
                    IdempotentFlowExecutor.canonical(tenant, space, page, field.strip(), value),
                    200,
                    PageDetail.class,
                    () -> authoringWrites.withWorkingWrite(
                            tenant,
                            space,
                            page,
                            false,
                            located -> projection.detail(
                                    PageMetadataResults.changed(pages.setProperty(
                                            new PageApi.PageId(page), field, value, access.pageActor(resolution))),
                                    located.slug(),
                                    resolution,
                                    tenant,
                                    located.space())));
        }
    }
}
