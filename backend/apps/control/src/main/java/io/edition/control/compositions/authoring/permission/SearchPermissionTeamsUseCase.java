package io.edition.control.compositions.authoring.permission;

import static io.edition.control.compositions.authoring.permission.PermissionTypes.*;

import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SearchPermissionTeamsUseCase {
    private final PermissionAccess access;

    private final PermissionQueries queries;

    private final ResourceChain resources;

    SearchPermissionTeamsUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.queries = dependencies.queries;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public PrincipalPage searchPermissionTeams(
            String credential, UUID tenant, UUID space, String query, String cursor, int limit) {
        access.require(credential, tenant, resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new));
        return queries.teams(tenant, query, cursor, limit);
    }
}
