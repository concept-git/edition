package io.space.control.compositions.authoring.permission;

import static io.space.control.compositions.authoring.permission.PermissionTypes.*;

import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SiteNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SearchSitePermissionUsersUseCase {
    private final PermissionAccess access;

    private final PermissionQueries queries;

    private final ResourceChain resources;

    SearchSitePermissionUsersUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.queries = dependencies.queries;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public PrincipalPage searchSitePermissionUsers(
            String credential, UUID tenant, UUID site, String query, String cursor, int limit) {
        access.requireSite(credential, tenant, resources.site(tenant, site).orElseThrow(SiteNotFoundException::new));
        return queries.users(tenant, query, cursor, limit);
    }
}
