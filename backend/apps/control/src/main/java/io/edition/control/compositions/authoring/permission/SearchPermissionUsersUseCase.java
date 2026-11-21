package io.edition.control.compositions.authoring.permission;

import static io.edition.control.compositions.authoring.permission.PermissionTypes.*;

import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SearchPermissionUsersUseCase {
    private final PermissionAccess access;

    private final PermissionQueries queries;

    private final ResourceChain resources;

    SearchPermissionUsersUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.queries = dependencies.queries;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public PrincipalPage searchPermissionUsers(
            String credential, UUID tenant, UUID space, String query, String cursor, int limit) {
        access.require(credential, tenant, resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new));
        return queries.users(tenant, query, cursor, limit);
    }
}
