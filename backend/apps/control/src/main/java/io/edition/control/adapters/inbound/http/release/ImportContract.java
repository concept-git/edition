package io.edition.control.adapters.inbound.http.release;

import com.fasterxml.jackson.annotation.JsonValue;
import io.edition.control.usecases.releases.bundleimport.BundleImportTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/** 持续导入端点的 OpenAPI 形态：flow 记录 → 契约 DTO。 */
final class ImportContract {
    private ImportContract() {}

    @Schema(name = "ImportAccepted")
    record AcceptedResponse(JobResponse job, ReleaseContract.DetailResponse release) {
        static AcceptedResponse from(BundleImportTypes.ImportAccepted value) {
            return new AcceptedResponse(
                    JobResponse.from(value.job()),
                    value.release() == null ? null : ReleaseContract.DetailResponse.from(value.release()));
        }
    }

    @Schema(name = "ImportJob")
    record JobResponse(
            UUID id,
            JobStatus status,
            JobPhase phase,
            ProgressResponse progress,
            int attempt,
            @Schema(nullable = true) Instant nextRunAt,
            String traceId,
            @Schema(nullable = true) JobOutcome outcome,
            @Schema(nullable = true) UUID releaseId,

            @Schema(nullable = true, description = "Public https address the zip was fetched from; null for uploads")
            String sourceUrl,

            @Schema(
                    nullable = true,
                    description = "Import format detected by sniffing (bundle-v1, hwcloud-docs, okf-v0.1, file-tree); "
                            + "null until the zip has been inspected or when no adapter matched")
            String adapterId,

            ReportResponse report,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean terminal,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean successful,

            @Schema(
                    nullable = true,
                    requiredMode = Schema.RequiredMode.REQUIRED,
                    description = "Suggested read-only polling interval; null when terminal")
            Integer nextPollAfterSeconds) {
        JobResponse {
            boolean done = status == JobStatus.COMPLETED || status == JobStatus.FAILED;
            boolean success =
                    status == JobStatus.COMPLETED && (outcome == JobOutcome.PROMOTED || outcome == JobOutcome.SKIPPED);
            if (terminal != done
                    || successful != success
                    || (done ? nextPollAfterSeconds != null : nextPollAfterSeconds == null))
                throw new IllegalStateException("inconsistent import job completion facts");
            if ((status == JobStatus.COMPLETED && (outcome == null || !outcome.completed()))
                    || (status == JobStatus.FAILED && (outcome == null || outcome.completed()))
                    || (!done && outcome != null))
                throw new IllegalStateException("invalid import job status/outcome combination");
        }

        static JobResponse from(BundleImportTypes.JobView value) {
            return new JobResponse(
                    value.id(),
                    JobStatus.valueOf(value.status().toUpperCase(Locale.ROOT)),
                    JobPhase.valueOf(value.phase().toUpperCase(Locale.ROOT)),
                    new ProgressResponse(value.progressDone(), value.progressTotal()),
                    value.attempt(),
                    value.nextRunAt(),
                    value.traceId(),
                    value.outcome() == null
                            ? null
                            : JobOutcome.valueOf(value.outcome().toUpperCase(Locale.ROOT)),
                    value.releaseId(),
                    value.sourceUrl(),
                    value.adapterId(),
                    ReportResponse.from(value.report()),
                    ImportContract.terminal(value.status()),
                    value.status().equals("completed")
                            && ("promoted".equals(value.outcome()) || "skipped".equals(value.outcome())),
                    ImportContract.terminal(value.status()) ? null : 2);
        }
    }

    private static boolean terminal(String status) {
        return status.equals("completed") || status.equals("failed");
    }

    enum JobStatus {
        QUEUED,
        RUNNING,
        RETRYING,
        HELD,
        FAILED,
        COMPLETED;

        @JsonValue
        public String value() {
            return name().toLowerCase(Locale.ROOT);
        }
    }

    enum JobPhase {
        QUEUED,
        INSPECTING,
        ADAPTING,
        STORING,
        LOADING,
        VALIDATING,
        COMPARING,
        PROMOTING,
        MIRRORING,
        COMPLETING,
        RUNNING,
        RETRYING,
        HELD,
        FAILED,
        COMPLETED;

        @JsonValue
        public String value() {
            return name().toLowerCase(Locale.ROOT);
        }
    }

    enum JobOutcome {
        PROMOTED,
        SKIPPED,
        HELD,
        FLAGGED,
        INVALID_BUNDLE,
        DEPENDENCY_FAILED,
        UNEXPECTED_ERROR,
        RESOURCE_UNAVAILABLE,
        RESOURCE_DELETED;

        @JsonValue
        public String value() {
            return name().toLowerCase(Locale.ROOT);
        }

        boolean completed() {
            return this == PROMOTED || this == SKIPPED || this == HELD || this == FLAGGED || this == INVALID_BUNDLE;
        }
    }

    @Schema(name = "ImportJobIssue")
    record IssueResponse(
            String code,
            @Schema(nullable = true) String path,
            @Schema(nullable = true) String detail) {}

    @Schema(name = "ImportJobReport")
    record ReportResponse(List<IssueResponse> errors, List<IssueResponse> info) {
        static ReportResponse from(BundleImportTypes.ImportReport report) {
            return new ReportResponse(
                    report.errors().stream()
                            .map(i -> new IssueResponse(i.code(), i.path(), i.detail()))
                            .toList(),
                    report.info().stream()
                            .map(i -> new IssueResponse(i.code(), i.path(), i.detail()))
                            .toList());
        }
    }

    @Schema(name = "ImportJobProgress")
    record ProgressResponse(
            @Schema(nullable = true) Integer done,
            @Schema(nullable = true) Integer total) {}

    @Schema(name = "ImportUpload")
    record UploadResponse(String putUrl, Instant expiresAt, String uploadKey) {
        static UploadResponse from(BundleImportTypes.ImportUpload value) {
            return new UploadResponse(value.putUrl(), value.expiresAt(), value.uploadKey());
        }
    }

    @Schema(name = "ApproveReleaseResult")
    record ApproveResponse(JobOutcome outcome, ReleaseContract.DetailResponse release) {
        static ApproveResponse from(BundleImportTypes.ApproveResult value) {
            return new ApproveResponse(
                    JobOutcome.valueOf(value.outcome().toUpperCase(Locale.ROOT)),
                    value.release() == null ? null : ReleaseContract.DetailResponse.from(value.release()));
        }
    }

    @Schema(name = "DriftBoard")
    record DriftBoardResponse(int driftCount, List<DriftItemResponse> items) {
        static DriftBoardResponse from(BundleImportTypes.DriftBoard value) {
            return new DriftBoardResponse(
                    value.driftCount(),
                    value.items().stream().map(DriftItemResponse::from).toList());
        }
    }

    @Schema(name = "DriftItem")
    record DriftItemResponse(UUID pageId, String slug, String title, String externalId) {
        static DriftItemResponse from(BundleImportTypes.DriftItem value) {
            return new DriftItemResponse(value.pageId(), value.slug(), value.title(), value.externalId());
        }
    }

    @Schema(name = "SnapshotPreview")
    record PreviewResponse(
            String html,
            String title,
            String slug,
            String format,
            String content,
            String contentType,
            String versionRef,
            Map<String, Object> interpretation,
            io.edition.content.ContentTypeSnapshot contentTypeDefinition) {
        static PreviewResponse from(BundleImportTypes.SnapshotPreview value) {
            return new PreviewResponse(
                    value.html(),
                    value.title(),
                    value.slug(),
                    value.format(),
                    value.content(),
                    value.contentType(),
                    value.versionRef(),
                    value.interpretation(),
                    value.contentTypeDefinition());
        }
    }

    @Schema(name = "SnapshotPreviewPages")
    record PreviewPagesResponse(List<PreviewPageResponse> items) {
        static PreviewPagesResponse from(List<BundleImportTypes.PreviewPage> pages) {
            return new PreviewPagesResponse(
                    pages.stream().map(PreviewPageResponse::from).toList());
        }
    }

    @Schema(name = "SnapshotPreviewPage")
    record PreviewPageResponse(UUID pageId, String slug, String title) {
        static PreviewPageResponse from(BundleImportTypes.PreviewPage page) {
            return new PreviewPageResponse(page.pageId(), page.slug(), page.title());
        }
    }
}
