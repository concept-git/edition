package io.edition.control.compositions.hosting.customdomain;

import static io.edition.control.compositions.hosting.customdomain.CustomDomainTypes.*;

import io.edition.concepts.customdomain.api.CustomDomainApi;
import io.edition.concepts.dnslookup.api.DnsLookupApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.hosting.site.SiteAccess;
import io.edition.control.compositions.resource.ResourceChain;
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
    final io.edition.control.compositions.resource.ResourceWriteLocks locks;
    final TenantDomainListing listing;

    CustomDomainDependencies(
            SiteAccess access,
            TenantAccess tenants,
            ResourceChain resources,
            CustomDomainApi domains,
            DnsLookupApi dns,
            IdempotentFlowExecutor idempotency,
            @Value("${io.edition.dns.auto-prove:false}") boolean autoProve,
            io.edition.control.compositions.resource.ResourceWriteLocks locks,
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
