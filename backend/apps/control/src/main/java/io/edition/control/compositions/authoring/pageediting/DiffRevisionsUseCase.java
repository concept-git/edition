package io.edition.control.compositions.authoring.pageediting;

import static io.edition.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.edition.concepts.revision.api.RevisionApi;
import io.edition.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DiffRevisionsUseCase {

    private final RevisionApi revisions;

    private final TenantAccess tenants;

    private final PageAccess access;
    private final PageProjection projection;

    DiffRevisionsUseCase(PageEditingDependencies dependencies) {
        this.revisions = dependencies.revisions;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public RevisionDiff diffRevisions(String credential, UUID tenant, UUID space, UUID page, int from, int to) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            access.workingPage(tenant, space, page);
            access.require(credential, tenant, space, page, TenantAccess.READ);
            return tenants.inTenant(
                    tenant,
                    () -> revisions
                            .diff(new RevisionApi.ItemId(page), from, to)
                            .map(projection::diff)
                            .orElseThrow(RevisionNotFoundException::new));
        }
    }
}
