package io.edition.control.usecases.hosting.customdomain;

import static io.edition.control.usecases.hosting.customdomain.CustomDomainTypes.*;

import io.edition.control.modules.customdomain.api.CustomDomainApi;
import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.hosting.site.SiteAccess;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SiteNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewDomainUseCase {
    private final SiteAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final CustomDomainApi domains;

    ViewDomainUseCase(CustomDomainDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.domains = dependencies.domains;
    }

    @Transactional
    public DomainDetail viewDomain(String credential, UUID tenant, UUID site, String host) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
            access.require(credential, tenant, existing, TenantAccess.ADMIN);
            String normalized = DomainResults.host(host);
            return tenants.inTenant(
                    tenant,
                    () -> DomainResults.detail(DomainResults.requireOnSite(domains.activeHostsOf(site), normalized)));
        }
    }
}
