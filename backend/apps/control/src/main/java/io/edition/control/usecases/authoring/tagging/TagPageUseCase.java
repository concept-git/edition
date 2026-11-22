package io.edition.control.usecases.authoring.tagging;

import static io.edition.control.usecases.authoring.tagging.TaggingTypes.*;

import io.edition.control.modules.tag.api.TagApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.authoring.pageediting.PageEditingTypes;
import io.edition.control.usecases.authoring.pageediting.PageProjection;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.PageNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class TagPageUseCase {

    private final TagApi tags;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final TagAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final PageProjection pageProjection;

    TagPageUseCase(TaggingDependencies dependencies) {
        this.tags = dependencies.tags;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.pageProjection = dependencies.pageProjection;
    }

    @Transactional
    public FlowResponse<PageEditingTypes.PageDetail> tagPage(
            String credential, UUID tenant, UUID space, UUID page, String label, String key) {
        resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
        Resolution resolution = access.require(credential, tenant, space, page, TenantAccess.WRITE);
        String parsed = TagLabels.require(label, "label");
        return idempotency.execute(
                resolution.principal(),
                key,
                "tag.tag",
                IdempotentFlowExecutor.canonical(tenant, space, page, parsed),
                200,
                PageEditingTypes.PageDetail.class,
                () -> authoringWrites.withWorkingWrite(tenant, space, page, false, located -> {
                    switch (tags.tag(new TagApi.ItemId(page), parsed)) {
                        case TagApi.TagResult.Tagged ignored -> {}
                        case TagApi.TagResult.TooMany ignored -> throw new TooManyTagsException();
                        case TagApi.TagResult.Invalid ignored ->
                            throw new TagInvalidException("label", "invalid_format");
                    }
                    return pageProjection.view(credential, tenant, space, page);
                }));
    }
}
