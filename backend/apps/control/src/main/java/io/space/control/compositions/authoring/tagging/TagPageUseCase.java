package io.space.control.compositions.authoring.tagging;

import static io.space.control.compositions.authoring.tagging.TaggingTypes.*;

import io.space.concepts.tag.api.TagApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.PageEditingTypes;
import io.space.control.compositions.authoring.pageediting.PageProjection;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.control.compositions.resource.PageNotFoundException;
import io.space.control.compositions.resource.ResourceChain;
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
