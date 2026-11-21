package io.edition.control.compositions.authoring.pageediting;

import static io.edition.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.edition.concepts.revision.api.RevisionApi;
import io.edition.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewRevisionUseCase {

    private final RevisionApi revisions;

    private final TenantAccess tenants;

    private final PageAccess access;
    private final PageProjection projection;

    ViewRevisionUseCase(PageEditingDependencies dependencies) {
        this.revisions = dependencies.revisions;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public RevisionDetail viewRevision(String credential, UUID tenant, UUID space, UUID page, int revision) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            var located = access.workingPage(tenant, space, page);
            access.require(credential, tenant, space, page, TenantAccess.READ);
            return tenants.inTenant(
                    tenant,
                    () -> revisions
                            .detail(new RevisionApi.ItemId(page), revision)
                            .map(detail ->
                                    projection.revision(detail, located.page().format()))
                            .orElseThrow(RevisionNotFoundException::new));
        }
    }
}
