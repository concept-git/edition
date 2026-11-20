package io.space.control.compositions.hosting.customdomain;

import static io.space.control.compositions.hosting.customdomain.CustomDomainTypes.*;

import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.hosting.site.SiteAccess;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SiteNotFoundException;
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
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
            access.require(credential, tenant, existing, TenantAccess.ADMIN);
            String normalized = DomainResults.host(host);
            return tenants.inTenant(
                    tenant,
                    () -> DomainResults.detail(DomainResults.requireOnSite(domains.activeHostsOf(site), normalized)));
        }
    }
}
