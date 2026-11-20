package io.space.control.compositions.releases.bundleimport;

import static io.space.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.space.concepts.importjob.api.ImportJobApi;
import io.space.concepts.objectstore.api.ObjectStoreApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.DriftFacts;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.PageRenderer;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.releases.release.ReleaseAccess;
import io.space.control.compositions.releases.release.ReleaseProjection;
import java.time.Duration;
import org.springframework.context.ApplicationEventPublisher;

@org.springframework.stereotype.Component
final class BundleImportDependencies {
    final BundleImportRelay relay;
    final ImportEligibility importEligibility;
    final io.space.control.compositions.resource.ResourceWriteLocks locks;
    static final long MAX_ZIP_BYTES = BundleImportTypes.MAX_ZIP_BYTES;
    static final Duration UPLOAD_TTL = Duration.ofMinutes(15);
    final io.space.concepts.deletionrecovery.api.DeletionRecoveryApi operations;
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
            io.space.concepts.deletionrecovery.api.DeletionRecoveryApi operations,
            io.space.control.compositions.resource.ResourceWriteLocks locks,
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
