package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.resource.PageNotFoundException;
import io.space.control.compositions.resource.ResourceChain;
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
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            resources.space(tenant, space).orElseThrow(PageNotFoundException::new);
            access.requireSpace(credential, tenant, space, TenantAccess.READ);
            if (content.getBytes(StandardCharsets.UTF_8).length > PageApi.MAX_CONTENT_BYTES) {
                throw new PageContentTooLargeException();
            }
            return new Preview(renderer.render(format, content));
        }
    }
}
