package io.edition.control.usecases.authoring.permission;

import static io.edition.control.usecases.authoring.permission.PermissionTypes.*;

import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SiteNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SearchSitePermissionTeamsUseCase {
    private final PermissionAccess access;

    private final PermissionQueries queries;

    private final ResourceChain resources;

    SearchSitePermissionTeamsUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.queries = dependencies.queries;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public PrincipalPage searchSitePermissionTeams(
            String credential, UUID tenant, UUID site, String query, String cursor, int limit) {
        access.requireSite(credential, tenant, resources.site(tenant, site).orElseThrow(SiteNotFoundException::new));
        return queries.teams(tenant, query, cursor, limit);
    }
}
