package io.space.control.compositions.hosting.site;

import static io.space.control.compositions.hosting.site.SiteTypes.*;

import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;

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
    final io.space.control.compositions.resource.ResourceWriteLocks locks;

    SiteDependencies(
            SiteAccess access,
            TenantAccess tenants,
            ResourceChain resources,
            SiteApi sites,
            CustomDomainApi domains,
            PermissionApi permissions,
            IdempotentFlowExecutor idempotency,
            SiteProjection projection,
            io.space.control.compositions.resource.ResourceWriteLocks locks) {
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
