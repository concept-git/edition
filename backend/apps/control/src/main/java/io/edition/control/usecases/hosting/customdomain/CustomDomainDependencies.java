package io.edition.control.usecases.hosting.customdomain;

import static io.edition.control.usecases.hosting.customdomain.CustomDomainTypes.*;

import io.edition.control.modules.customdomain.api.CustomDomainApi;
import io.edition.control.modules.dnslookup.api.DnsLookupApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.hosting.site.SiteAccess;
import io.edition.control.usecases.resource.ResourceChain;
import org.springframework.beans.factory.annotation.Value;

@org.springframework.stereotype.Component
final class CustomDomainDependencies {
    final SiteAccess access;
    final TenantAccess tenants;
    final ResourceChain resources;
    final CustomDomainApi domains;
    final DnsLookupApi dns;
    final IdempotentFlowExecutor idempotency;
    final boolean autoProve;
    final io.edition.control.usecases.resource.ResourceWriteLocks locks;
    final TenantDomainListing listing;

    CustomDomainDependencies(
            SiteAccess access,
            TenantAccess tenants,
            ResourceChain resources,
            CustomDomainApi domains,
            DnsLookupApi dns,
            IdempotentFlowExecutor idempotency,
            @Value("${io.edition.dns.auto-prove:false}") boolean autoProve,
            io.edition.control.usecases.resource.ResourceWriteLocks locks,
            TenantDomainListing listing) {
        this.locks = locks;
        this.listing = listing;
        this.access = access;
        this.tenants = tenants;
        this.resources = resources;
        this.domains = domains;
        this.dns = dns;
        this.idempotency = idempotency;
        this.autoProve = autoProve;
    }
}
