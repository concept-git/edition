package io.edition.control.usecases.authoring.pageediting;

import static io.edition.control.usecases.authoring.pageediting.PageEditingTypes.*;

import io.edition.control.modules.revision.api.RevisionApi;
import io.edition.control.usecases.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListRevisionsUseCase {

    private final RevisionApi revisions;

    private final TenantAccess tenants;

    private final PageAccess access;
    private final PageProjection projection;

    ListRevisionsUseCase(PageEditingDependencies dependencies) {
        this.revisions = dependencies.revisions;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public RevisionPage listRevisions(String credential, UUID tenant, UUID space, UUID page, String cursor, int limit) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            access.workingPage(tenant, space, page);
            access.require(credential, tenant, space, page, TenantAccess.READ);
            return tenants.inTenant(
                    tenant, () -> projection.revisions(revisions.page(new RevisionApi.ItemId(page), cursor, limit)));
        }
    }
}
