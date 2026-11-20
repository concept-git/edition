package io.space.control.compositions.hosting.customdomain;

import static io.space.control.compositions.hosting.customdomain.CustomDomainTypes.*;

import io.space.control.compositions.hosting.site.SiteAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListDomainsUseCase {
    private final SiteAccess access;

    private final TenantDomainListing listing;

    ListDomainsUseCase(CustomDomainDependencies dependencies) {
        this.access = dependencies.access;
        this.listing = dependencies.listing;
    }

    @Transactional(readOnly = true)
    public TenantDomainPage listDomains(
            String credential, UUID tenant, java.util.Optional<UUID> site, String cursor, int limit) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            var resolution = access.requireListAccess(credential, tenant);
            return listing.page(resolution, tenant, site, cursor, limit);
        }
    }
}
