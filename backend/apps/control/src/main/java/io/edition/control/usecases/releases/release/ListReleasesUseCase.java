package io.edition.control.usecases.releases.release;

import static io.edition.control.usecases.releases.release.ReleaseTypes.*;

import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.InvalidCursorException;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListReleasesUseCase {

    private final ReleaseApi releases;
    private final TenantAccess tenants;

    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    ListReleasesUseCase(ReleaseDependencies dependencies) {
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public ReleasePage listReleases(String credential, UUID tenant, UUID space, String cursor, int limit) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.READ);
            return tenants.inTenant(tenant, () -> {
                final ReleaseApi.Page page;
                try {
                    page = releases.page(Set.of(new ReleaseApi.ScopeId(space)), Optional.empty(), cursor, limit);
                } catch (IllegalArgumentException invalid) {
                    throw new InvalidCursorException();
                }
                return projection.page(page.items(), page.nextCursor(), resolution, tenant, owner);
            });
        }
    }
}
