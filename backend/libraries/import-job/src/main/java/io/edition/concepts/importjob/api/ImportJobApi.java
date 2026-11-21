package io.edition.concepts.importjob.api;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/** 导入作业出口：拥有 {@code shared.jobs} 中 {@code type=import} 的行。 */
public interface ImportJobApi {
    void saveReport(UUID job, Report report);

    record Issue(String code, String path, String detail) {}

    record Report(java.util.List<Issue> errors, java.util.List<Issue> info) {
        public Report {
            errors = bounded(errors);
            info = bounded(info);
        }

        public static Report empty() {
            return new Report(java.util.List.of(), java.util.List.of());
        }

        private static java.util.List<Issue> bounded(java.util.List<Issue> issues) {
            if (issues == null) return java.util.List.of();
            var result = new java.util.ArrayList<Issue>();
            for (var issue :
                    issues.stream().limit(issues.size() > 100 ? 99 : 100).toList()) {
                result.add(new Issue(shortText(issue.code()), shortText(issue.path()), shortText(issue.detail())));
            }
            if (issues.size() > 100) result.add(new Issue("issues_truncated", null, Integer.toString(issues.size())));
            return java.util.List.copyOf(result);
        }

        private static String shortText(String text) {
            return text == null || text.length() <= 1000 ? text : text.substring(0, 1000);
        }
    }

    long queueDepth();

    default View enqueue(UUID tenantId, UUID spaceId, UUID releaseId, String zipSha256, String zipKey, String traceId) {
        return enqueue(tenantId, spaceId, releaseId, zipSha256, zipKey, traceId, null);
    }

    /** {@code sourceUrl} 仅远程地址导入有值，记入 payload 供作业视图回显；不进 Release。 */
    View enqueue(
            UUID tenantId,
            UUID spaceId,
            UUID releaseId,
            String zipSha256,
            String zipKey,
            String traceId,
            String sourceUrl);

    Optional<View> view(UUID jobId);

    Optional<View> viewBySpace(UUID spaceId, UUID jobId);

    boolean hasUnfinished(UUID spaceId);

    void advisoryLock(UUID spaceId);

    View markRunning(UUID jobId, String phase);

    void markProgress(UUID jobId, String phase, Integer progressDone, Integer progressTotal);

    View complete(UUID jobId, String status, String outcome, String adapterId);

    View retrying(UUID jobId, String error, Instant nextRunAt);

    View fail(UUID jobId, String outcome, String error);

    record View(
            UUID id,
            UUID tenantId,
            UUID spaceId,
            String status,
            String phase,
            Integer progressDone,
            Integer progressTotal,
            int attempt,
            Instant nextRunAt,
            String outcome,
            UUID releaseId,
            String zipSha256,
            String zipKey,
            String adapterId,
            String traceId,
            Instant createdAt,
            String sourceUrl,
            Report report) {}

    void terminateSpace(UUID space);

    boolean referencesObject(String key);

    boolean tryAdvisoryLock(UUID space);

    java.util.List<Pending> pending(int limit);

    java.util.List<View> list(UUID before, UUID space, String status, int limit);
    /** 与 list 同一过滤（忽略游标）的总数，供列表页显示「已加载 N / 总数」。 */
    long count(UUID space, String status);

    boolean retryFailed(UUID job);

    void retrying(UUID job, String error, Instant nextRunAt, int attempt);

    void fail(UUID job, String outcome, String error, int attempt);

    record Pending(UUID tenantId, UUID jobId) {}

    java.util.Map<String, Long> outcomes(UUID space, Instant from, Instant to);
}
