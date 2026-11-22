package io.edition.control.usecases.hosting.site;

import static io.edition.control.usecases.hosting.site.SiteTypes.*;

import io.edition.control.modules.customdomain.api.CustomDomainApi;
import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.ResourceChain;

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
    final io.edition.control.usecases.resource.ResourceWriteLocks locks;

    SiteDependencies(
            SiteAccess access,
            TenantAccess tenants,
            ResourceChain resources,
            SiteApi sites,
            CustomDomainApi domains,
            PermissionApi permissions,
            IdempotentFlowExecutor idempotency,
            SiteProjection projection,
            io.edition.control.usecases.resource.ResourceWriteLocks locks) {
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
