package io.edition.control.compositions.platform.operations;

import static io.edition.control.compositions.platform.operations.OperationsTypes.*;

import io.edition.concepts.audit.api.AuditApi;
import io.edition.concepts.importjob.api.ImportJobApi;
import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.*;
import io.edition.control.compositions.access.PlatformOperatorGuard;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.authoring.termination.ExpiredTrashPurge;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;
import java.time.*;
import java.util.*;

@org.springframework.stereotype.Component
final class OperationsDependencies {
    final io.edition.concepts.space.api.SpaceApi spaces;
    final io.edition.concepts.site.api.SiteApi sites;
    final io.edition.concepts.audit.api.AuditExportsApi exports;
    final io.edition.concepts.objectstore.api.ObjectStoreApi objects;
    final Clock clock;
    final io.edition.concepts.objectstore.api.ObjectReservationsApi reservations;
    final io.edition.concepts.servicehealth.api.ServiceHealthApi health;
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
            io.edition.concepts.space.api.SpaceApi spaces,
            io.edition.concepts.site.api.SiteApi sites,
            io.edition.concepts.audit.api.AuditExportsApi exports,
            io.edition.concepts.objectstore.api.ObjectStoreApi objects,
            Clock clock,
            io.edition.concepts.objectstore.api.ObjectReservationsApi reservations,
            io.edition.concepts.servicehealth.api.ServiceHealthApi health) {
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
