package io.edition.control.usecases.hosting.customdomain;

import static io.edition.control.usecases.hosting.customdomain.CustomDomainTypes.*;

import io.edition.control.modules.customdomain.api.CustomDomainApi;
import io.edition.control.modules.dnslookup.api.DnsLookupApi;
import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.hosting.site.SiteAccess;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SiteNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class VerifyDomainUseCase {
    private final SiteAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final CustomDomainApi domains;
    private final DnsLookupApi dns;
    private final IdempotentFlowExecutor idempotency;
    private final boolean autoProve;
    private final io.edition.control.usecases.resource.ResourceWriteLocks locks;

    VerifyDomainUseCase(CustomDomainDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.domains = dependencies.domains;
        this.dns = dependencies.dns;
        this.idempotency = dependencies.idempotency;
        this.autoProve = dependencies.autoProve;
        this.locks = dependencies.locks;
    }

    @Transactional
    public FlowResponse<DomainDetail> verifyDomain(String credential, UUID tenant, UUID site, String host, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
            var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
            String normalized = DomainResults.host(host);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "domain.verify",
                    IdempotentFlowExecutor.canonical(tenant, site, normalized),
                    200,
                    DomainDetail.class,
                    () -> tenants.inTenant(tenant, () -> {
                        locks.site(tenant, site);
                        var current = DomainResults.requireOnSite(domains.activeHostsOf(site), normalized);
                        if (!current.verified() && !DomainProof.matches(dns, autoProve, current))
                            DomainFailures.verifyFailed();
                        var verified = DomainResults.verified(domains.verify(normalized, current.dnsToken()));
                        if (domains.primaryOf(site).isEmpty()) {
                            verified = DomainResults.primary(domains.setPrimary(normalized));
                        }
                        return DomainResults.detail(verified);
                    }));
        }
    }
}
