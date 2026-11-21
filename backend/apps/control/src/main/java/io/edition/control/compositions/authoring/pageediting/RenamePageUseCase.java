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
public class RenamePageUseCase {

    private final PageApi pages;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final PageAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;

    RenamePageUseCase(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<PageDetail> renamePage(
            String credential, UUID tenant, UUID space, UUID page, String title, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
            var resolution = access.require(credential, tenant, space, page, TenantAccess.WRITE);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.rename",
                    IdempotentFlowExecutor.canonical(tenant, space, page, title.strip()),
                    200,
                    PageDetail.class,
                    () -> authoringWrites.withWorkingWrite(tenant, space, page, false, located -> {
                        PageApi.View changed =
                                switch (pages.rename(new PageApi.PageId(page), title, access.pageActor(resolution))) {
                                    case PageApi.MutationResult.Changed value -> value.page();
                                    case PageApi.MutationResult.NotFound ignored -> throw new PageNotFoundException();
                                    case PageApi.MutationResult.InvalidTitle ignored ->
                                        throw new PageTitleInvalidException();
                                };
                        return projection.detail(changed, located.slug(), resolution, tenant, located.space());
                    }));
        }
    }
}
