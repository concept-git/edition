package io.edition.control.usecases.releases.bundleexport;

import static io.edition.control.usecases.releases.bundleexport.BundleExportTypes.*;

import io.edition.control.modules.bundleexport.api.*;
import io.edition.control.modules.objectstore.api.*;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.releases.release.ReleaseAccess;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;

@org.springframework.stereotype.Component
final class BundleExportDependencies {
    final io.edition.control.modules.deletionrecovery.api.DeletionRecoveryApi operations;
    final BundleExportAccess access;
    final ReleaseAccess releaseAccess;
    final TenantAccess tenants;
    final ReleaseApi releases;
    final BundleExportJobs jobs;
    final ObjectStoreApi objects;
    final ObjectReservationsApi reservations;
    final IdempotentFlowExecutor idempotency;
    final BundleExportProjection projection;
    final Clock clock;
    final Duration lifetime;

    BundleExportDependencies(
            BundleExportAccess access,
            ReleaseAccess releaseAccess,
            TenantAccess tenants,
            ReleaseApi releases,
            BundleExportJobs jobs,
            ObjectStoreApi objects,
            ObjectReservationsApi reservations,
            IdempotentFlowExecutor idempotency,
            BundleExportProjection projection,
            Clock clock,
            @Value("${io.edition.bundle-export.lifetime:PT24H}") Duration lifetime,
            io.edition.control.modules.deletionrecovery.api.DeletionRecoveryApi operations) {
        this.operations = operations;
        this.access = access;
        this.releaseAccess = releaseAccess;
        this.tenants = tenants;
        this.releases = releases;
        this.jobs = jobs;
        this.objects = objects;
        this.reservations = reservations;
        this.idempotency = idempotency;
        this.projection = projection;
        this.clock = clock;
        this.lifetime = lifetime;
        if (lifetime.isNegative() || lifetime.isZero() || lifetime.compareTo(Duration.ofDays(7)) > 0)
            throw new IllegalArgumentException("export lifetime must be positive and at most seven days");
    }
}
