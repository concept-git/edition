package io.edition.control.compositions.hosting.site;

import static io.edition.control.compositions.hosting.site.SiteTypes.*;

import io.edition.concepts.customdomain.api.CustomDomainApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;

@org.springframework.stereotype.Component
final class SiteDependencies {
    final SiteAccess access;
    final TenantAccess tenants;
    final ResourceChain resources;
    final SiteApi sites;
    final CustomDomainApi domains;
    final PermissionApi permissions;
    final IdempotentFlowExecutor idempotency;
    final SiteProjection projection;
    final io.edition.control.compositions.resource.ResourceWriteLocks locks;

    SiteDependencies(
            SiteAccess access,
            TenantAccess tenants,
            ResourceChain resources,
            SiteApi sites,
            CustomDomainApi domains,
            PermissionApi permissions,
            IdempotentFlowExecutor idempotency,
            SiteProjection projection,
            io.edition.control.compositions.resource.ResourceWriteLocks locks) {
        this.locks = locks;
        this.access = access;
        this.tenants = tenants;
        this.resources = resources;
        this.sites = sites;
        this.domains = domains;
        this.permissions = permissions;
        this.idempotency = idempotency;
        this.projection = projection;
    }
}
