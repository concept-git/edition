package io.edition.control.compositions.releases.bundleimport;

import static io.edition.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.edition.concepts.release.api.ReleaseApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.authoring.pageediting.PageRenderer;
import io.edition.control.compositions.releases.release.ReleaseAccess;
import io.edition.control.compositions.releases.release.ReleaseNotFoundException;
import io.edition.control.compositions.resource.PageNotFoundException;
import java.util.Locale;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PreviewReleaseUseCase {

    private final ReleaseApi releases;

    private final TenantAccess tenants;

    private final ReleaseAccess access;

    private final PageRenderer renderer;

    PreviewReleaseUseCase(BundleImportDependencies dependencies) {
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.renderer = dependencies.renderer;
    }

    @Transactional(readOnly = true)
    public SnapshotPreview previewRelease(
            String credential, UUID tenant, UUID space, UUID releaseId, String slug, UUID pageId) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            access.space(tenant, space);
            access.require(credential, tenant, space, TenantAccess.PUBLISH);
            return tenants.inTenant(tenant, () -> {
                ReleaseApi.View current = access.requireRelease(space, releaseId);
                if (current.status() != ReleaseApi.Status.DRAFT
                        && current.status() != ReleaseApi.Status.FLAGGED
                        && current.status() != ReleaseApi.Status.VALIDATED
                        && current.status() != ReleaseApi.Status.ARCHIVED) {
                    throw new ReleaseNotFoundException();
                }
                ReleaseApi.Bundle bundle =
                        releases.export(new ReleaseApi.ReleaseId(releaseId)).orElseThrow(ReleaseNotFoundException::new);
                ReleaseApi.PageSnapshot page = bundle.pages().stream()
                        .filter(item -> pageId == null
                                ? item.slug().equals(slug)
                                : item.pageId().equals(pageId))
                        .findFirst()
                        .orElseThrow(PageNotFoundException::new);
                String format = page.format().name().toLowerCase(Locale.ROOT);
                return new SnapshotPreview(
                        renderer.render(format, page.content()),
                        page.title(),
                        page.slug(),
                        format,
                        page.content(),
                        page.contentProfile().contentType(),
                        page.contentProfile().versionRef(),
                        page.contentProfile().interpretation(),
                        page.contentTypeDefinition());
            });
        }
    }
}
