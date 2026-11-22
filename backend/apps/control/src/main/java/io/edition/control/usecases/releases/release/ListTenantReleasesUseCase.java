package io.edition.control.usecases.releases.release;

import static io.edition.control.usecases.releases.release.ReleaseTypes.*;

import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListTenantReleasesUseCase {

    private final ReleaseAccess access;

    private final TenantReleaseListing tenantListing;

    ListTenantReleasesUseCase(ReleaseDependencies dependencies) {
        this.access = dependencies.access;
        this.tenantListing = dependencies.tenantListing;
    }

    @Transactional(readOnly = true)
    public TenantReleasePage listTenantReleases(
            String credential, UUID tenant, TenantReleaseFilter filter, String cursor, int limit) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            Resolution resolution = access.admit(credential, tenant);
            return tenantListing.page(resolution, tenant, filter, cursor, limit);
        }
    }
}
