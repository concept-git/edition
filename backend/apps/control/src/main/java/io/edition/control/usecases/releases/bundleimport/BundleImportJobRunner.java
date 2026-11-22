package io.edition.control.usecases.releases.bundleimport;

import io.edition.control.modules.importformat.api.ImportFormatApi;
import io.edition.control.modules.importformat.archive.ZipPackSource;
import io.edition.control.modules.importformat.contract.AdaptedPack;
import io.edition.control.modules.importjob.api.ImportJobApi;
import io.edition.control.modules.objectstore.api.ObjectStoreApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.DriftFacts;
import io.edition.control.usecases.RequestAuditContext;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.releases.release.ReleaseDecisions;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.zip.ZipException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.RecoverableDataAccessException;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** 导入作业执行器（线程池异步调用）；持 space advisory lock。不放在 ContinuousImportUseCase continuousImportUseCase, StartImportUploadUseCase startImportUploadUseCase, ViewImportJobUseCase viewImportJobUseCase, ViewDriftUseCase viewDriftUseCase, ListPreviewPagesUseCase listPreviewPagesUseCase, PreviewReleaseUseCase previewReleaseUseCase, ApproveReleaseUseCase approveReleaseUseCase。 */
@Component
class BundleImportJobRunner {
    private static final Logger LOG = LoggerFactory.getLogger(BundleImportJobRunner.class);
    private static final int MAX_ATTEMPTS = 5;
    private final ImportJobProgress progress;
    private final SpaceApi spaces;
    private final io.edition.control.usecases.resource.ContentTypes contentTypes;
    private final ImportJobApi jobs;
    private final ReleaseApi releases;
    private final ImportFormatApi formats;
    private final ObjectStoreApi objectStore;
    private final ImportPageIds pageIds;
    private final DriftFacts drift;
    private final ImportedWorkspaceMirror mirror;
    private final TenantAccess tenants;
    private final Clock clock;
    private final TransactionTemplate transactions;

    BundleImportJobRunner(
            ImportJobApi jobs,
            ReleaseApi releases,
            ImportFormatApi formats,
            ObjectStoreApi objectStore,
            ImportPageIds pageIds,
            DriftFacts drift,
            ImportedWorkspaceMirror mirror,
            TenantAccess tenants,
            Clock clock,
            PlatformTransactionManager transactions,
            ImportJobProgress progress,
            SpaceApi spaces,
            io.edition.control.usecases.resource.ContentTypes contentTypes) {
        this.contentTypes = contentTypes;
        this.progress = progress;
        this.spaces = spaces;
        this.jobs = jobs;
        this.releases = releases;
        this.formats = formats;
        this.objectStore = objectStore;
        this.pageIds = pageIds;
        this.drift = drift;
        this.mirror = mirror;
        this.tenants = tenants;
        this.clock = clock;
        this.transactions = new TransactionTemplate(transactions);
    }

    void run(UUID tenant, UUID jobId) {
        // 进度独立提交；失败回执携本次 attempt，不能覆盖重试后更新的作业。
        var attempt = new AtomicInteger(-1);
        try (var auditContext = RequestAuditContext.open("system", null, null, "job:" + jobId, tenant)) {
            try {
                transactions.executeWithoutResult(
                        status -> tenants.inTenant(tenant, () -> runImportAttempt(jobId, attempt)));
            } catch (ObjectStoreApi.Unavailable failure) {
                tenants.inTenant(tenant, () -> retry(jobId, "dependency_unavailable", attempt.get()));
            } catch (TransientDataAccessException
                    | RecoverableDataAccessException
                    | DataAccessResourceFailureException failure) {
                tenants.inTenant(tenant, () -> retry(jobId, "database_unavailable", attempt.get()));
            } catch (UncheckedIOException failure) {
                if (failure.getCause() instanceof ZipException) {
                    transactions.executeWithoutResult(
                            status -> tenants.inTenant(tenant, () -> completeInvalid(jobId, attempt.get())));
                } else {
                    tenants.inTenant(tenant, () -> retry(jobId, "dependency_unavailable", attempt.get()));
                }
            } catch (IllegalStateException failure) {
                LOG.atError()
                        .setCause(failure)
                        .addKeyValue("jobId", jobId)
                        .log("Import job failed with an unexpected state");
                tenants.inTenant(tenant, () -> failUnexpected(jobId, attempt.get()));
            }
        }
    }

    private void runImportAttempt(UUID jobId, AtomicInteger attempt) {
        ImportJobApi.View job = jobs.view(jobId).orElse(null);
        if (job == null || terminal(job.status()) || !jobs.tryAdvisoryLock(job.spaceId())) return;
        // 取锁前的状态可能过期；以锁内重读的记录为准。
        job = jobs.view(jobId).orElse(null);
        if (job == null || terminal(job.status())) return;
        if (job.releaseId() == null || job.zipKey() == null) {
            jobs.fail(jobId, "unexpected_error", "invalid_job_record");
            LOG.atError().addKeyValue("jobId", jobId).log("Import job has incomplete recovery metadata");
            return;
        }
        if ("retrying".equals(job.status())
                && job.nextRunAt() != null
                && job.nextRunAt().isAfter(clock.instant())) return;
        var owner = spaces.lock(new SpaceApi.SpaceId(job.spaceId()));
        if (owner.isEmpty()
                || owner.orElseThrow().status() != SpaceApi.Status.ACTIVE
                || owner.orElseThrow().mode() != SpaceApi.Mode.SYNCED) {
            jobs.fail(jobId, "resource_unavailable", "resource_unavailable");
            return;
        }
        job = progress.start(job);
        attempt.set(job.attempt());
        ReleaseApi.ReleaseId releaseId = new ReleaseApi.ReleaseId(job.releaseId());
        try (ImportTimings timings = new ImportTimings(jobId);
                ImportZipFile zip = ImportZipFile.copy(objectStore
                        .open(job.zipKey())
                        .orElseThrow(() -> new ObjectStoreApi.Unavailable("import zip missing", null)))) {
            ImportFormatApi.Result adapted;
            List<AdaptedPack.Issue> adaptationInfo;
            try (ZipPackSource source = new ZipPackSource(zip.path())) {
                int entries = source.index().names().size();
                progress.phase(job, "adapting", 0, entries);
                ObjectStoreAdaptSink sink = new ObjectStoreAdaptSink(objectStore);
                progress.phase(job, "storing", 0, entries);
                timings.phase("adapting");
                adapted = formats.adapt(source.index(), source, sink);
                adaptationInfo = sink.issues();
            }
            progress.report(
                    job,
                    switch (adapted) {
                        case ImportFormatApi.Result.Invalid invalid ->
                            new ImportJobApi.Report(reportIssues(invalid.issues()), reportIssues(adaptationInfo));
                        case ImportFormatApi.Result.Adapted adaptedOk ->
                            new ImportJobApi.Report(
                                    List.of(), reportIssues(adaptedOk.pack().info()));
                        case ImportFormatApi.Result.UnknownFormat ignored ->
                            new ImportJobApi.Report(
                                    List.of(new ImportJobApi.Issue(
                                            "unknown_format", null, "no supported document format")),
                                    List.of());
                    });
            if (adapted instanceof ImportFormatApi.Result.UnknownFormat
                    || adapted instanceof ImportFormatApi.Result.Invalid) {
                releases.discard(releaseId);
                jobs.complete(jobId, "completed", "invalid_bundle", adapterId(adapted));
                return;
            }
            ImportFormatApi.Result.Adapted ok = (ImportFormatApi.Result.Adapted) adapted;
            timings.phase("loading");
            progress.phase(job, "loading", null, null);
            ImportPageIds.Assignment assignment =
                    pageIds.assign(job.spaceId(), ok.pack().pages());
            ReleaseApi.Bundle bundle =
                    contentTypes.imported(ImportBundleAssembler.assemble(ok.pack(), assignment, clock.instant()));
            ReleaseApi.LoadResult loaded = releases.load(releaseId, bundle);
            if (loaded instanceof ReleaseApi.LoadResult.InvalidBundle rejected) {
                progress.report(
                        job,
                        new ImportJobApi.Report(
                                rejected.report().errors().stream()
                                        .map(i -> new ImportJobApi.Issue(i.code(), i.path(), i.detail()))
                                        .toList(),
                                reportIssues(ok.pack().info())));
                releases.discard(releaseId);
                jobs.complete(jobId, "completed", "invalid_bundle", ok.adapterId());
                return;
            }
            timings.phase("validating");
            progress.phase(job, "validating", null, null);
            Set<String> externalIds = ok.pack().pages().stream()
                    .map(AdaptedPack.Page::externalId)
                    .collect(Collectors.toUnmodifiableSet());
            List<ReleaseApi.Issue> formatErrors = assignment.formatChanges().stream()
                    .map(change -> new ReleaseApi.Issue(
                            "unsupported_format",
                            change.externalId(),
                            change.pageId(),
                            change.previous() + "→" + change.next()))
                    .toList();
            ReleaseApi.ValidateResult validated =
                    releases.validate(releaseId, drift.coverageWarnings(job.spaceId(), externalIds), formatErrors);
            if (validated instanceof ReleaseApi.ValidateResult.Warnings) {
                jobs.complete(jobId, "completed", "flagged", ok.adapterId());
                return;
            }
            if (validated instanceof ReleaseApi.ValidateResult.Errors) {
                jobs.complete(jobId, "completed", "held", ok.adapterId());
                return;
            }
            timings.phase("comparing");
            Optional<ReleaseApi.View> live = releases.live(new ReleaseApi.ScopeId(job.spaceId()));
            boolean diffEmpty = live.isPresent()
                    && releases.diff(new ReleaseApi.ReleaseId(live.orElseThrow().id()), releaseId)
                            .map(ReleaseApi.Delta::empty)
                            .orElse(true);
            boolean snapshotUnchanged = live.flatMap(version -> releases.export(new ReleaseApi.ReleaseId(version.id())))
                    .map(existing -> existing.toc().equals(bundle.toc())
                            && existing.pages().equals(bundle.pages()))
                    .orElse(false);
            if (ReleaseDecisions.skip(live.isPresent(), bundle.pages().size(), diffEmpty, snapshotUnchanged)) {
                releases.discard(releaseId);
                jobs.complete(jobId, "completed", "skipped", ok.adapterId());
                return;
            }
            timings.phase("promoting");
            progress.phase(job, "promoting", null, null);
            releases.promote(releaseId);
            timings.phase("mirroring");
            progress.phase(job, "mirroring", 0, bundle.pages().size());
            mirror.mirrorReleaseIntoWorkspace(job.spaceId(), bundle, assignment.trash());
            timings.phase("completing");
            releases.prune(new ReleaseApi.ScopeId(job.spaceId()));
            jobs.complete(jobId, "completed", "promoted", ok.adapterId());
        } catch (io.edition.control.usecases.resource.ContentTypes.Invalid invalid) {
            var violation = invalid.violations().getFirst();
            progress.report(
                    job,
                    new ImportJobApi.Report(
                            List.of(new ImportJobApi.Issue(
                                    violation.code(),
                                    violation.field(),
                                    "Register the matching trusted content type version before importing.")),
                            List.of()));
            releases.discard(releaseId);
            jobs.complete(jobId, "completed", "invalid_bundle", null);
        } catch (ZipException | ZipPackSource.ZipSlipException slip) {
            releases.discard(releaseId);
            jobs.complete(jobId, "completed", "invalid_bundle", null);
        } catch (IOException failure) {
            throw new UncheckedIOException(failure);
        }
    }

    private static boolean terminal(String status) {
        return "completed".equals(status) || "failed".equals(status);
    }

    private void completeInvalid(UUID jobId, int attempt) {
        if (attempt < 0) return;
        ImportJobApi.View job = jobs.view(jobId).orElse(null);
        if (job == null || !jobs.tryAdvisoryLock(job.spaceId())) return;
        job = jobs.view(jobId).orElse(null);
        if (job == null || !"running".equals(job.status()) || job.attempt() != attempt) return;
        releases.discard(new ReleaseApi.ReleaseId(job.releaseId()));
        jobs.complete(jobId, "completed", "invalid_bundle", null);
    }

    private void failUnexpected(UUID jobId, int attempt) {
        ImportJobApi.View job = jobs.view(jobId).orElse(null);
        if (job == null || terminal(job.status())) return;
        jobs.fail(jobId, "unexpected_error", "unexpected_error", attempt);
    }

    private void retry(UUID jobId, String error, int attempt) {
        ImportJobApi.View job = jobs.view(jobId).orElse(null);
        if (job == null || terminal(job.status()) || attempt < 0 || job.attempt() != attempt) return;
        if (job.attempt() >= MAX_ATTEMPTS) {
            jobs.fail(jobId, "dependency_failed", error, attempt);
            return;
        }
        int next = job.attempt() + 1;
        long seconds = Math.min(60L * (1L << Math.min(next, 10)), 15L * 60L);
        jobs.retrying(
                jobId,
                error,
                clock.instant()
                        .plusSeconds(seconds + ThreadLocalRandom.current().nextLong(10)),
                attempt);
    }

    private static String adapterId(ImportFormatApi.Result result) {
        return switch (result) {
            case ImportFormatApi.Result.Adapted adapted -> adapted.adapterId();
            case ImportFormatApi.Result.Invalid invalid -> invalid.adapterId();
            case ImportFormatApi.Result.UnknownFormat ignored -> null;
        };
    }

    private static List<ImportJobApi.Issue> reportIssues(List<AdaptedPack.Issue> issues) {
        return issues.stream()
                .map(issue -> new ImportJobApi.Issue(issue.code(), issue.path(), issue.detail()))
                .toList();
    }
}
