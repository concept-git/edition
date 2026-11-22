package io.edition.control.usecases.platform.operations;

import static io.edition.control.usecases.platform.operations.OperationsTypes.*;

import io.edition.control.modules.audit.api.AuditApi;
import io.edition.control.modules.importjob.api.ImportJobApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.modules.user.api.UserApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.authoring.termination.ExpiredTrashPurge;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.ResourceChain;
import java.time.*;
import java.util.*;

@org.springframework.stereotype.Component
final class OperationsDependencies {
    final io.edition.control.modules.space.api.SpaceApi spaces;
    final io.edition.control.modules.site.api.SiteApi sites;
    final io.edition.control.modules.audit.api.AuditExportsApi exports;
    final io.edition.control.modules.objectstore.api.ObjectStoreApi objects;
    final Clock clock;
    final io.edition.control.modules.objectstore.api.ObjectReservationsApi reservations;
    final io.edition.control.modules.servicehealth.api.ServiceHealthApi health;
    final AuditApi audit;
    final ImportJobApi jobs;
    final TenantAccess tenants;
    final TenantRegistryApi registry;
    final PlatformOperatorGuard operators;
    final ResourceChain resources;
    final UserApi users;
    final ReleaseApi releases;
    final IdempotentFlowExecutor idempotency;
    final ExpiredTrashPurge expiredTrashPurge;

    public OperationsDependencies(
            AuditApi audit,
            ImportJobApi jobs,
            TenantAccess tenants,
            TenantRegistryApi registry,
            PlatformOperatorGuard operators,
            ResourceChain resources,
            UserApi users,
            ReleaseApi releases,
            IdempotentFlowExecutor idempotency,
            ExpiredTrashPurge expiredTrashPurge,
            io.edition.control.modules.space.api.SpaceApi spaces,
            io.edition.control.modules.site.api.SiteApi sites,
            io.edition.control.modules.audit.api.AuditExportsApi exports,
            io.edition.control.modules.objectstore.api.ObjectStoreApi objects,
            Clock clock,
            io.edition.control.modules.objectstore.api.ObjectReservationsApi reservations,
            io.edition.control.modules.servicehealth.api.ServiceHealthApi health) {
        this.reservations = reservations;
        this.health = health;
        this.exports = exports;
        this.objects = objects;
        this.clock = clock;
        this.spaces = spaces;
        this.sites = sites;
        this.audit = audit;
        this.jobs = jobs;
        this.tenants = tenants;
        this.registry = registry;
        this.operators = operators;
        this.resources = resources;
        this.users = users;
        this.releases = releases;
        this.idempotency = idempotency;
        this.expiredTrashPurge = expiredTrashPurge;
    }
}
