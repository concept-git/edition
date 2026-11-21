package io.edition.concepts.importjob.adapters.persistence;

import io.edition.concepts.importjob.api.*;
import io.edition.concepts.importjob.api.ImportJobApi;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
class MyBatisImportJobs implements ImportJobApi {
    private final ImportJobMapper mapper;
    private final tools.jackson.databind.json.JsonMapper json;

    MyBatisImportJobs(ImportJobMapper mapper, tools.jackson.databind.json.JsonMapper json) {
        this.json = json;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public void saveReport(UUID job, ImportJobApi.Report report) {
        mapper.saveReport(job, json.writeValueAsString(report));
    }

    public long queueDepth() {
        return mapper.queueDepth();
    }

    @Override
    @Transactional
    public ImportJobApi.View enqueue(
            UUID tenantId,
            UUID spaceId,
            UUID releaseId,
            String zipSha256,
            String zipKey,
            String traceId,
            String sourceUrl) {
        Objects.requireNonNull(tenantId, "tenant id");
        Objects.requireNonNull(spaceId, "space id");
        Objects.requireNonNull(releaseId, "release id");
        Objects.requireNonNull(zipSha256, "zip sha256");
        Objects.requireNonNull(zipKey, "zip key");
        return view(mapper.insert(tenantId, spaceId, releaseId, zipSha256, zipKey, traceId, sourceUrl));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ImportJobApi.View> view(UUID jobId) {
        return Optional.ofNullable(mapper.find(jobId)).map(this::view);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ImportJobApi.View> viewBySpace(UUID spaceId, UUID jobId) {
        return Optional.ofNullable(mapper.findBySpace(spaceId, jobId)).map(this::view);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUnfinished(UUID spaceId) {
        return mapper.hasUnfinished(spaceId);
    }

    @Override
    @Transactional
    public void advisoryLock(UUID spaceId) {
        mapper.advisoryLock(spaceId);
    }

    @Override
    @Transactional
    public ImportJobApi.View markRunning(UUID jobId, String phase) {
        return Optional.ofNullable(mapper.markRunning(jobId, phase))
                .map(this::view)
                .orElseThrow(() -> missing(jobId));
    }

    @Override
    @Transactional
    public void markProgress(UUID jobId, String phase, Integer progressDone, Integer progressTotal) {
        mapper.markProgress(jobId, phase, progressDone, progressTotal);
    }

    @Override
    @Transactional
    public ImportJobApi.View complete(UUID jobId, String status, String outcome, String adapterId) {
        return Optional.ofNullable(mapper.complete(jobId, status, outcome, adapterId))
                .map(this::view)
                .orElseThrow(() -> missing(jobId));
    }

    @Override
    @Transactional
    public ImportJobApi.View retrying(UUID jobId, String error, Instant nextRunAt) {
        return Optional.ofNullable(mapper.retrying(jobId, error, nextRunAt))
                .map(this::view)
                .orElseThrow(() -> missing(jobId));
    }

    @Override
    @Transactional
    public ImportJobApi.View fail(UUID jobId, String outcome, String error) {
        return Optional.ofNullable(mapper.fail(jobId, outcome, error))
                .map(this::view)
                .orElseThrow(() -> missing(jobId));
    }

    private static IllegalStateException missing(UUID jobId) {
        return new IllegalStateException("import job missing: " + jobId);
    }

    private ImportJobApi.View view(ImportJobMapper.JobRow row) {
        return new ImportJobApi.View(
                row.id(),
                row.tenantId(),
                row.spaceId(),
                row.status(),
                row.phase(),
                row.progressDone(),
                row.progressTotal(),
                row.attempt(),
                row.nextRunAt(),
                row.outcome(),
                row.releaseId(),
                row.zipSha256(),
                row.zipKey(),
                row.adapterId(),
                row.traceId(),
                row.createdAt(),
                row.sourceUrl(),
                row.report() == null
                        ? ImportJobApi.Report.empty()
                        : json.readValue(row.report(), ImportJobApi.Report.class));
    }

    @Override
    public void terminateSpace(UUID space) {
        mapper.terminateSpace(space);
        mapper.clearPayloads(space);
    }

    @Override
    public boolean referencesObject(String key) {
        return mapper.referencesObject(key);
    }

    @Override
    public boolean tryAdvisoryLock(UUID space) {
        return mapper.tryAdvisoryLock(space);
    }

    @Override
    public java.util.List<ImportJobApi.Pending> pending(int limit) {
        return mapper.pending(limit).stream()
                .map(r -> new ImportJobApi.Pending(UUID.fromString(r.tenantId()), UUID.fromString(r.id())))
                .toList();
    }

    @Override
    public java.util.List<ImportJobApi.View> list(UUID before, UUID space, String status, int limit) {
        return mapper.list(before, space, status, limit).stream()
                .map(this::view)
                .toList();
    }

    @Override
    public long count(UUID space, String status) {
        return mapper.count(space, status);
    }

    @Override
    public boolean retryFailed(UUID job) {
        return mapper.retryFailed(job) > 0;
    }

    @Override
    public void retrying(UUID job, String error, Instant next, int attempt) {
        mapper.retryAttempt(job, error, next, attempt);
    }

    @Override
    public void fail(UUID job, String outcome, String error, int attempt) {
        mapper.failAttempt(job, outcome, error, attempt);
    }

    @Override
    public java.util.Map<String, Long> outcomes(UUID space, Instant from, Instant to) {
        var result = new java.util.LinkedHashMap<String, Long>();
        for (var row : mapper.outcomes(space, from, to)) result.put(row.outcome(), row.count());
        return result;
    }
}
