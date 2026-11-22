package io.edition.control.usecases.authoring.pageediting;

import static io.edition.control.usecases.authoring.pageediting.PageEditingTypes.*;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.resource.PageNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PreviewPageUseCase {

    private final ResourceChain resources;

    private final PageAccess access;

    private final PageRenderer renderer;

    PreviewPageUseCase(PageEditingDependencies dependencies) {
        this.resources = dependencies.resources;
        this.access = dependencies.access;
        this.renderer = dependencies.renderer;
    }

    @Transactional(readOnly = true)
    public Preview previewPage(String credential, UUID tenant, UUID space, String format, String content) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            resources.space(tenant, space).orElseThrow(PageNotFoundException::new);
            access.requireSpace(credential, tenant, space, TenantAccess.READ);
            if (content.getBytes(StandardCharsets.UTF_8).length > PageApi.MAX_CONTENT_BYTES) {
                throw new PageContentTooLargeException();
            }
            return new Preview(renderer.render(format, content));
        }
    }
}
