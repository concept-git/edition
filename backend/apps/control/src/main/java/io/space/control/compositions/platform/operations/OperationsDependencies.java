package io.space.control.compositions.platform.operations;

import static io.space.control.compositions.platform.operations.OperationsTypes.*;

import io.space.concepts.audit.api.AuditApi;
import io.space.concepts.importjob.api.ImportJobApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.*;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.termination.ExpiredTrashPurge;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;
import java.time.*;
import java.util.*;

@org.springframework.stereotype.Component
final class OperationsDependencies {
    final io.space.concepts.space.api.SpaceApi spaces;
    final io.space.concepts.site.api.SiteApi sites;
    final io.space.concepts.audit.api.AuditExportsApi exports;
    final io.space.concepts.objectstore.api.ObjectStoreApi objects;
    final Clock clock;
    final io.space.concepts.objectstore.api.ObjectReservationsApi reservations;
    final io.space.concepts.servicehealth.api.ServiceHealthApi health;
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
            io.space.concepts.space.api.SpaceApi spaces,
            io.space.concepts.site.api.SiteApi sites,
            io.space.concepts.audit.api.AuditExportsApi exports,
            io.space.concepts.objectstore.api.ObjectStoreApi objects,
            Clock clock,
            io.space.concepts.objectstore.api.ObjectReservationsApi reservations,
            io.space.concepts.servicehealth.api.ServiceHealthApi health) {
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
