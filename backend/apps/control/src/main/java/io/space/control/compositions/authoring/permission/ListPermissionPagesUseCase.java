package io.space.control.compositions.authoring.permission;

import static io.space.control.compositions.authoring.permission.PermissionTypes.*;

import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListPermissionPagesUseCase {
    private final PermissionAccess access;

    private final PermissionQueries queries;

    private final ResourceChain resources;

    ListPermissionPagesUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.queries = dependencies.queries;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public PermissionPage listPermissionPages(String credential, UUID tenant, UUID space, String cursor, int limit) {
        var authorized = access.require(
                credential, tenant, resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new));
        return queries.pages(tenant, authorized, cursor, limit);
    }
}
