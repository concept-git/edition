package io.edition.control.usecases.hosting.site;

import static io.edition.control.usecases.hosting.site.SiteTypes.*;

import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListSitesUseCase {
    private final SiteAccess access;

    private final SiteProjection projection;

    ListSitesUseCase(SiteDependencies dependencies) {
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public SitePage listSites(String credential, UUID tenant, String cursor, int limit) {
        Resolution resolution = access.requireListAccess(credential, tenant);
        return projection.list(resolution, tenant, cursor, limit);
    }
}
