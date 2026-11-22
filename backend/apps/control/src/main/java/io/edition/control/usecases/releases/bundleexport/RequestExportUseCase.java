package io.edition.control.usecases.releases.bundleexport;

import static io.edition.control.usecases.releases.bundleexport.BundleExportTypes.*;

import io.edition.control.modules.bundleexport.api.*;
import io.edition.control.modules.objectstore.api.*;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.releases.release.ReleaseAccess;
import io.edition.control.usecases.releases.release.ReleaseNotFoundException;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RequestExportUseCase {
    private final io.edition.control.modules.deletionrecovery.api.DeletionRecoveryApi operations;
    private final BundleExportAccess access;
    private final ReleaseAccess releaseAccess;
    private final TenantAccess tenants;
    private final ReleaseApi releases;
    private final BundleExportJobs jobs;

    private final ObjectReservationsApi reservations;
    private final IdempotentFlowExecutor idempotency;
    private final BundleExportProjection projection;
    private final Clock clock;
    private final Duration lifetime;

    RequestExportUseCase(BundleExportDependencies dependencies) {
        this.operations = dependencies.operations;
        this.access = dependencies.access;
        this.releaseAccess = dependencies.releaseAccess;
        this.tenants = dependencies.tenants;
        this.releases = dependencies.releases;
        this.jobs = dependencies.jobs;
        this.reservations = dependencies.reservations;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
        this.clock = dependencies.clock;
        this.lifetime = dependencies.lifetime;
    }

    @Transactional
    public FlowResponse<Job> requestExport(String credential, UUID tenant, UUID space, UUID release, String key) {
        access.require(credential, tenant, space);
        operations.lockSpace(space);
        releaseAccess.lockSpace(tenant, space);
        var authorized = access.capture(credential, tenant, space, release);
        return idempotency.execute(
                authorized.actor().principal(),
                key,
                "bundle.export",
                IdempotentFlowExecutor.canonical(tenant, space, release),
                202,
                Job.class,
                () -> tenants.inTenant(tenant, () -> {
                    UUID id = UUID.randomUUID();
                    Instant until = clock.instant().plus(lifetime);
                    if (!releases.pin(new ReleaseApi.ReleaseId(release), id, until))
                        throw new ReleaseNotFoundException();
                    var input = projection.snapshot(authorized.bundle());
                    input.pages().stream()
                            .flatMap(p -> p.attachments().stream())
                            .map(ExportSnapshot.Attachment::storageKey)
                            .distinct()
                            .sorted()
                            .forEach(reservations::protect);
                    return projection.job(
                            jobs.enqueue(id, tenant, space, release, input, until, org.slf4j.MDC.get("requestId")));
                }));
    }
}
