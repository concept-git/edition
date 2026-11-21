package io.edition.control.compositions.authoring.tagging;

import static io.edition.control.compositions.authoring.tagging.TaggingTypes.*;

import io.edition.concepts.tag.api.TagApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.authoring.pageediting.PageEditingTypes;
import io.edition.control.compositions.authoring.pageediting.PageProjection;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.PageNotFoundException;
import io.edition.control.compositions.resource.ResourceChain;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class UntagPageUseCase {

    private final TagApi tags;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final TagAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final PageProjection pageProjection;

    UntagPageUseCase(TaggingDependencies dependencies) {
        this.tags = dependencies.tags;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.pageProjection = dependencies.pageProjection;
    }

    @Transactional
    public FlowResponse<PageEditingTypes.PageDetail> untagPage(
            String credential, UUID tenant, UUID space, UUID page, String label, String key) {
        resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
        Resolution resolution = access.require(credential, tenant, space, page, TenantAccess.WRITE);
        String parsed = TagLabels.require(label, "label");
        return idempotency.execute(
                resolution.principal(),
                key,
                "tag.untag",
                IdempotentFlowExecutor.canonical(tenant, space, page, parsed),
                200,
                PageEditingTypes.PageDetail.class,
                () -> authoringWrites.withWorkingWrite(tenant, space, page, false, located -> {
                    switch (tags.untag(new TagApi.ItemId(page), parsed)) {
                        case TagApi.UntagResult.Untagged ignored -> {}
                        case TagApi.UntagResult.Invalid ignored ->
                            throw new TagInvalidException("label", "invalid_format");
                    }
                    return pageProjection.view(credential, tenant, space, page);
                }));
    }
}
