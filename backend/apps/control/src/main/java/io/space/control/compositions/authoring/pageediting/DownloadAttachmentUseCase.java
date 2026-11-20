package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.space.concepts.objectstore.api.ObjectStoreApi;
import io.space.concepts.page.api.PageApi;
import io.space.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DownloadAttachmentUseCase {

    private final PageApi pages;

    private final TenantAccess tenants;

    private final PageAccess access;

    private final ObjectStoreApi objectStore;

    DownloadAttachmentUseCase(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.objectStore = dependencies.objectStore;
    }

    @Transactional(readOnly = true)
    public AttachmentContent downloadAttachment(String credential, UUID tenant, UUID space, UUID page, UUID ref) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            access.workingPage(tenant, space, page);
            access.require(credential, tenant, space, page, TenantAccess.READ);
            var attachment = tenants.inTenant(tenant, () -> pages.attachment(new PageApi.PageId(page), ref))
                    .orElseThrow(AttachmentNotFoundException::new);
            try {
                var stream = objectStore
                        .open(attachment.storageKey())
                        .orElseThrow(() -> new ObjectStoreApi.Unavailable("referenced attachment missing", null));
                return new AttachmentContent(stream, attachment.filename(), attachment.mime(), attachment.sizeBytes());
            } catch (ObjectStoreApi.Unavailable failure) {
                throw new ObjectStoreUnavailableException(failure);
            }
        }
    }
}
