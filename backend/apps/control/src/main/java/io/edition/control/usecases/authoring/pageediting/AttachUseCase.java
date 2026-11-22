package io.edition.control.usecases.authoring.pageediting;

import static io.edition.control.usecases.authoring.pageediting.PageEditingTypes.*;

import io.edition.control.modules.objectstore.api.ObjectStoreApi;
import io.edition.control.modules.page.api.PageApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.PageNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.shared.Sha256;
import java.util.UUID;
import org.slf4j.Logger;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class AttachUseCase {

    private static final Logger log = PageEditingDependencies.log;

    private final PageApi pages;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final PageAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;

    private final ObjectStoreApi objectStore;

    AttachUseCase(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
        this.objectStore = dependencies.objectStore;
    }

    @Transactional
    public FlowResponse<PageDetail> attach(
            String credential, UUID tenant, UUID space, UUID page, String filename, byte[] bytes, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
            var resolution = access.require(credential, tenant, space, page, TenantAccess.WRITE);
            String sha256 = Sha256.hex(bytes);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.attach",
                    IdempotentFlowExecutor.canonical(tenant, space, page, sha256, filename.strip()),
                    201,
                    PageDetail.class,
                    () -> authoringWrites.withWorkingWrite(tenant, space, page, false, located -> {
                        var attached =
                                switch (pages.attach(
                                        new PageApi.PageId(page),
                                        new PageApi.FileUpload(filename, bytes),
                                        access.pageActor(resolution))) {
                                    case PageApi.AttachResult.Attached value -> value;
                                    case PageApi.AttachResult.NotFound ignored -> throw new PageNotFoundException();
                                    case PageApi.AttachResult.FileTooLarge ignored -> throw new FileTooLargeException();
                                    case PageApi.AttachResult.FileTypeUnsupported ignored ->
                                        throw new FileTypeUnsupportedException();
                                    case PageApi.AttachResult.TooManyAttachments ignored ->
                                        throw new TooManyAttachmentsException();
                                    case PageApi.AttachResult.Invalid invalid ->
                                        throw new MetadataInvalidException(invalid.field(), invalid.code());
                                };
                        try {
                            objectStore.putIfAbsent(
                                    attached.attachment().storageKey(),
                                    bytes,
                                    attached.attachment().mime());
                        } catch (ObjectStoreApi.Unavailable failure) {
                            log.error("Object store unavailable while attaching to page {}", page, failure);
                            throw new ObjectStoreUnavailableException(failure);
                        }
                        return projection.detail(attached.page(), located.slug(), resolution, tenant, located.space());
                    }));
        }
    }
}
