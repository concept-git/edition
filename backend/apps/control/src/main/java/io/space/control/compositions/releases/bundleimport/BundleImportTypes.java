package io.space.control.compositions.releases.bundleimport;

import static io.space.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.space.concepts.importjob.api.ImportJobApi;
import io.space.control.compositions.releases.release.ReleaseTypes;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class BundleImportTypes {
    public static final long MAX_ZIP_BYTES = 500L * 1024 * 1024;

    private BundleImportTypes() {}

    public sealed interface ImportSource {
        record ZipStream(InputStream body, long declaredSize) implements ImportSource {}

        record StoredUpload(String uploadKey) implements ImportSource {}
        /** 受理时由服务端同步拉取的公开 https 地址（见 RemoteZipFetcher）。 */
        record RemoteZip(String url) implements ImportSource {}
    }

    public record ImportAccepted(JobView job, ReleaseTypes.ReleaseDetail release) {}

    public record JobView(
            UUID id,
            String status,
            String phase,
            Integer progressDone,
            Integer progressTotal,
            int attempt,
            Instant nextRunAt,
            String traceId,
            String outcome,
            UUID releaseId,
            String sourceUrl,
            String adapterId,
            ImportReport report) {
        static JobView of(ImportJobApi.View job) {
            return new JobView(
                    job.id(),
                    job.status(),
                    job.phase(),
                    job.progressDone(),
                    job.progressTotal(),
                    job.attempt(),
                    job.nextRunAt(),
                    job.traceId(),
                    job.outcome(),
                    job.releaseId(),
                    job.sourceUrl(),
                    job.adapterId(),
                    ImportReport.of(job.report()));
        }
    }

    public record ImportIssue(String code, String path, String detail) {}

    public record ImportReport(List<ImportIssue> errors, List<ImportIssue> info) {
        static ImportReport of(ImportJobApi.Report report) {
            return new ImportReport(
                    report.errors().stream()
                            .map(i -> new ImportIssue(i.code(), i.path(), i.detail()))
                            .toList(),
                    report.info().stream()
                            .map(i -> new ImportIssue(i.code(), i.path(), i.detail()))
                            .toList());
        }
    }

    public record ImportUpload(String putUrl, Instant expiresAt, String uploadKey) {}

    public record DriftBoard(int driftCount, List<DriftItem> items) {
        public DriftBoard {
            items = items == null ? List.of() : List.copyOf(items);
        }
    }

    public record DriftItem(UUID pageId, String slug, String title, String externalId) {}

    public record PreviewPage(String slug, String title) {}

    public record SnapshotPreview(
            String html,
            String title,
            String slug,
            String format,
            String content,
            String contentType,
            String versionRef,
            Map<String, Object> interpretation,
            io.space.content.ContentTypeSnapshot contentTypeDefinition) {}

    public record ApproveResult(String outcome, ReleaseTypes.ReleaseDetail release) {}
}
