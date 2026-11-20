package io.space.control.compositions.releases.bundleimport;

import static io.space.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.space.concepts.release.api.ReleaseApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.releases.release.ReleaseAccess;
import io.space.control.compositions.releases.release.ReleaseNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListPreviewPagesUseCase {

    private final ReleaseApi releases;

    private final TenantAccess tenants;

    private final ReleaseAccess access;

    ListPreviewPagesUseCase(BundleImportDependencies dependencies) {
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
    }

    @Transactional(readOnly = true)
    public List<PreviewPage> listPreviewPages(String credential, UUID tenant, UUID space, UUID releaseId) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
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
                return releases.pagesOf(new ReleaseApi.ReleaseId(releaseId)).stream()
                        .map(page -> new PreviewPage(page.slug(), page.title()))
                        .toList();
            });
        }
    }
}
