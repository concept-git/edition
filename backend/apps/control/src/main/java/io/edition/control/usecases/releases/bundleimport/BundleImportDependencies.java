package io.edition.control.usecases.releases.bundleimport;

import static io.edition.control.usecases.releases.bundleimport.BundleImportTypes.*;

import io.edition.control.modules.importjob.api.ImportJobApi;
import io.edition.control.modules.objectstore.api.ObjectStoreApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.DriftFacts;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.authoring.pageediting.PageRenderer;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.releases.release.ReleaseAccess;
import io.edition.control.usecases.releases.release.ReleaseProjection;
import java.time.Duration;
import org.springframework.context.ApplicationEventPublisher;

@org.springframework.stereotype.Component
final class BundleImportDependencies {
    final BundleImportRelay relay;
    final ImportEligibility importEligibility;
    final io.edition.control.usecases.resource.ResourceWriteLocks locks;
    static final long MAX_ZIP_BYTES = BundleImportTypes.MAX_ZIP_BYTES;
    static final Duration UPLOAD_TTL = Duration.ofMinutes(15);
    final io.edition.control.modules.deletionrecovery.api.DeletionRecoveryApi operations;
    final ReleaseApi releases;
    final ImportJobApi jobs;
    final TenantAccess tenants;
    final AuthoringWrites authoringWrites;
    final ReleaseAccess access;
    final ReleaseProjection projection;
    final IdempotentFlowExecutor idempotency;
    final ImportZipIngress ingress;
    final DriftFacts drift;
    final ImportedWorkspaceMirror mirror;
    final ObjectStoreApi objectStore;
    final PageRenderer renderer;
    final ApplicationEventPublisher events;

    BundleImportDependencies(
            ReleaseApi releases,
            ImportJobApi jobs,
            TenantAccess tenants,
            AuthoringWrites authoringWrites,
            ReleaseAccess access,
            ReleaseProjection projection,
            IdempotentFlowExecutor idempotency,
            ImportZipIngress ingress,
            DriftFacts drift,
            ImportedWorkspaceMirror mirror,
            ObjectStoreApi objectStore,
            PageRenderer renderer,
            ApplicationEventPublisher events,
            io.edition.control.modules.deletionrecovery.api.DeletionRecoveryApi operations,
            io.edition.control.usecases.resource.ResourceWriteLocks locks,
            ImportEligibility importEligibility,
            BundleImportRelay relay) {
        this.relay = relay;
        this.importEligibility = importEligibility;
        this.locks = locks;
        this.operations = operations;
        this.releases = releases;
        this.jobs = jobs;
        this.tenants = tenants;
        this.authoringWrites = authoringWrites;
        this.access = access;
        this.projection = projection;
        this.idempotency = idempotency;
        this.ingress = ingress;
        this.drift = drift;
        this.mirror = mirror;
        this.objectStore = objectStore;
        this.renderer = renderer;
        this.events = events;
    }
}
