package io.edition.control.compositions.authoring.pageediting;

import static io.edition.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewAttachmentUseCase {

    private final PageApi pages;

    private final SpaceApi spaces;

    private final TenantAccess tenants;

    private final PageAccess access;
    private final PageProjection projection;

    ViewAttachmentUseCase(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.spaces = dependencies.spaces;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public AttachmentLink viewAttachment(String credential, UUID tenant, UUID space, UUID page, UUID ref) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            access.workingPage(tenant, space, page);
            access.require(credential, tenant, space, page, TenantAccess.READ);
            PageApi.Attachment attachment = tenants.inTenant(
                            tenant, () -> pages.attachment(new PageApi.PageId(page), ref))
                    .orElseThrow(AttachmentNotFoundException::new);
            String url = "/api/v1/tenants/" + tenant + "/spaces/" + space + "/pages/" + page + "/attachments/" + ref
                    + "/content";
            return projection.attachmentLink(attachment, url, null);
        }
    }
}
