package io.edition.control.adapters.inbound.http.release;

import io.edition.control.adapters.inbound.http.problem.GatewayProblemException;
import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.adapters.inbound.http.security.IdempotencyKeyFilter;
import io.edition.control.adapters.inbound.http.security.IdempotentReplay;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.control.usecases.releases.bundleimport.ApproveReleaseUseCase;
import io.edition.control.usecases.releases.bundleimport.BundleImportTypes;
import io.edition.control.usecases.releases.bundleimport.ContinuousImportUseCase;
import io.edition.control.usecases.releases.bundleimport.ListPreviewPagesUseCase;
import io.edition.control.usecases.releases.bundleimport.PreviewReleaseUseCase;
import io.edition.control.usecases.releases.bundleimport.StartImportUploadUseCase;
import io.edition.control.usecases.releases.bundleimport.ViewDriftUseCase;
import io.edition.control.usecases.releases.bundleimport.ViewImportJobUseCase;
import io.edition.shared.ValidationViolation;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.json.JsonMapper;

/** 持续导入 HTTP：zip / 预签名 / 作业 / 漂移 / 审批 / 快照预览。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/spaces/{spaceId}")
class ImportController {
    static final long MAX_ZIP_BYTES = BundleImportTypes.MAX_ZIP_BYTES;
    private static final String ZIP = "application/zip";
    private final ContinuousImportUseCase continuousImportUseCase;
    private final StartImportUploadUseCase startImportUploadUseCase;
    private final ViewImportJobUseCase viewImportJobUseCase;
    private final ViewDriftUseCase viewDriftUseCase;
    private final ListPreviewPagesUseCase listPreviewPagesUseCase;
    private final PreviewReleaseUseCase previewReleaseUseCase;
    private final ApproveReleaseUseCase approveReleaseUseCase;
    private final BearerCredential bearer;
    private final JsonMapper json;

    ImportController(
            ContinuousImportUseCase continuousImportUseCase,
            StartImportUploadUseCase startImportUploadUseCase,
            ViewImportJobUseCase viewImportJobUseCase,
            ViewDriftUseCase viewDriftUseCase,
            ListPreviewPagesUseCase listPreviewPagesUseCase,
            PreviewReleaseUseCase previewReleaseUseCase,
            ApproveReleaseUseCase approveReleaseUseCase,
            BearerCredential bearer,
            JsonMapper json) {
        this.continuousImportUseCase = continuousImportUseCase;
        this.startImportUploadUseCase = startImportUploadUseCase;
        this.viewImportJobUseCase = viewImportJobUseCase;
        this.viewDriftUseCase = viewDriftUseCase;
        this.listPreviewPagesUseCase = listPreviewPagesUseCase;
        this.previewReleaseUseCase = previewReleaseUseCase;
        this.approveReleaseUseCase = approveReleaseUseCase;
        this.bearer = bearer;
        this.json = json;
    }

    @PostMapping(
            value = "/releases:import",
            consumes = {ZIP, MediaType.APPLICATION_OCTET_STREAM_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    @Operation(
            operationId = "importRelease",
            summary = "Import a zip or uploadKey into a synced Space and enqueue the job")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = {
                @Content(mediaType = ZIP, schema = @Schema(type = "string", format = "binary")),
                @Content(
                        mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE,
                        schema = @Schema(type = "string", format = "binary")),
                @Content(
                        mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                        schema = @Schema(implementation = ZipFilePart.class))
            })
    @ImportAcceptedResponses
    ResponseEntity<String> importZip(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Parameter(hidden = true) HttpServletRequest request)
            throws IOException {
        return accepted(continuousImportUseCase.continuousImport(
                bearer.require(),
                tenantId,
                spaceId,
                ImportZipParts.source(request),
                IdempotencyKeyFilter.require(request)));
    }

    @PostMapping(value = "/releases:import", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            operationId = "importRelease",
            summary = "Import a zip or uploadKey into a synced Space and enqueue the job")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ImportAcceptedResponses
    ResponseEntity<String> importStored(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody FromUploadRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return accepted(continuousImportUseCase.continuousImport(
                bearer.require(), tenantId, spaceId, body.source(), IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/releases:import-uploads")
    @Operation(operationId = "startImportUpload", summary = "Create a short-lived PUT URL for a large import zip")
    @UploadResponses
    ImportContract.UploadResponse startImportUpload(@PathVariable UUID tenantId, @PathVariable UUID spaceId) {
        return ImportContract.UploadResponse.from(
                startImportUploadUseCase.startImportUpload(bearer.require(), tenantId, spaceId));
    }

    @GetMapping("/import-jobs/{jobId}")
    @Operation(operationId = "viewImportJob", summary = "Read one import job in this Space")
    @JobResponses
    ImportContract.JobResponse viewImportJob(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @PathVariable UUID jobId) {
        return ImportContract.JobResponse.from(
                viewImportJobUseCase.viewImportJob(bearer.require(), tenantId, spaceId, jobId));
    }

    @PostMapping("/releases/{releaseId}:approve")
    @Operation(operationId = "approveRelease", summary = "Approve a flagged import Release and promote it")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApproveResponses
    ResponseEntity<String> approveRelease(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID releaseId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return approved(approveReleaseUseCase.approveRelease(
                bearer.require(), tenantId, spaceId, releaseId, IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/drift")
    @Operation(operationId = "viewDrift", summary = "Read live vs last-import drift in this Space")
    @DriftResponses
    ImportContract.DriftBoardResponse viewDrift(@PathVariable UUID tenantId, @PathVariable UUID spaceId) {
        return ImportContract.DriftBoardResponse.from(viewDriftUseCase.viewDrift(bearer.require(), tenantId, spaceId));
    }

    @GetMapping("/releases/{releaseId}/preview")
    @Operation(operationId = "listReleasePreviewPages", summary = "List snapshot pages available for preview")
    @PreviewPagesResponses
    ImportContract.PreviewPagesResponse listPreviewPages(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @PathVariable UUID releaseId) {
        return ImportContract.PreviewPagesResponse.from(
                listPreviewPagesUseCase.listPreviewPages(bearer.require(), tenantId, spaceId, releaseId));
    }

    @GetMapping("/releases/{releaseId}/preview/{slug}")
    @Operation(operationId = "previewRelease", summary = "Render one snapshot page from a not-yet-live Release")
    @PreviewResponses
    ImportContract.PreviewResponse previewRelease(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID releaseId,
            @PathVariable String slug) {
        return ImportContract.PreviewResponse.from(
                previewReleaseUseCase.previewRelease(bearer.require(), tenantId, spaceId, releaseId, slug, null));
    }

    @GetMapping("/releases/{releaseId}/preview/by-id/{pageId}")
    @Operation(operationId = "previewReleaseByPageId", summary = "Render one frozen snapshot page by Page ID")
    @PreviewResponses
    ImportContract.PreviewResponse previewReleaseByPageId(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID releaseId,
            @PathVariable UUID pageId) {
        return ImportContract.PreviewResponse.from(
                previewReleaseUseCase.previewRelease(bearer.require(), tenantId, spaceId, releaseId, null, pageId));
    }

    static long declaredSize(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.CONTENT_LENGTH);
        if (header != null && !header.isBlank()) {
            try {
                return Long.parseLong(header.strip());
            } catch (NumberFormatException ignored) {
                return request.getContentLengthLong();
            }
        }
        return request.getContentLengthLong();
    }

    /** 202 信封把 JobView 的 progressDone/Total 收成 API.md 的 nested progress。 */
    private ResponseEntity<String> accepted(FlowResponse<BundleImportTypes.ImportAccepted> response) {
        return IdempotentReplay.builder(response)
                .body(json.writeValueAsString(ImportContract.AcceptedResponse.from(response.value())));
    }

    private ResponseEntity<String> approved(FlowResponse<BundleImportTypes.ApproveResult> response) {
        return IdempotentReplay.builder(response)
                .body(json.writeValueAsString(ImportContract.ApproveResponse.from(response.value())));
    }

    /** JSON 入站二选一：预签名上传的 {@code uploadKey}，或服务端拉取的公开 https {@code url}。 */
    @Schema(
            name = "ImportFromUploadRequest",
            description =
                    "Exactly one of uploadKey (presigned upload) or url (public https zip fetched by the server).")
    record FromUploadRequest(
            @Schema(nullable = true) @Size(max = 512) String uploadKey,
            @Schema(nullable = true) @Size(max = 2048) String url) {
        BundleImportTypes.ImportSource source() {
            boolean hasKey = uploadKey != null && !uploadKey.isBlank();
            boolean hasUrl = url != null && !url.isBlank();
            if (hasKey == hasUrl) {
                throw new ImportSourceChoiceException();
            }
            return hasKey
                    ? new BundleImportTypes.ImportSource.StoredUpload(uploadKey)
                    : new BundleImportTypes.ImportSource.RemoteZip(url);
        }
    }

    static final class ImportSourceChoiceException extends GatewayProblemException {
        ImportSourceChoiceException() {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("uploadKey|url", "exactly_one")));
        }
    }

    @Schema(name = "ImportZipFilePart")
    record ZipFilePart(
            @Schema(type = "string", format = "binary") byte[] file) {}

    static final class ZipTooLargeException extends GatewayProblemException {
        ZipTooLargeException() {
            super(ProblemCode.FILE_TOO_LARGE, List.of(new ValidationViolation("zip", "too_large")));
        }
    }

    /** 声明大小已通过时仍限制实读：最多 500 MiB + 1 字节用于判定超限。 */
    static final class CappedZipInputStream extends FilterInputStream {
        private long seen;

        CappedZipInputStream(InputStream in) {
            super(in);
        }

        @Override
        public int read() throws IOException {
            if (seen > MAX_ZIP_BYTES) throw new ZipTooLargeException();
            int value = super.read();
            if (value >= 0) account(1);
            return value;
        }

        @Override
        public int read(byte[] buffer, int offset, int length) throws IOException {
            if (length <= 0) return super.read(buffer, offset, length);
            long allowed = MAX_ZIP_BYTES + 1 - seen;
            if (allowed <= 0) throw new ZipTooLargeException();
            int n = super.read(buffer, offset, (int) Math.min(length, allowed));
            if (n > 0) account(n);
            return n;
        }

        @Override
        public long skip(long n) throws IOException {
            if (n <= 0) return 0;
            long allowed = MAX_ZIP_BYTES + 1 - seen;
            if (allowed <= 0) throw new ZipTooLargeException();
            long skipped = super.skip(Math.min(n, allowed));
            if (skipped > 0) account(skipped);
            return skipped;
        }

        private void account(long n) {
            seen += n;
            if (seen > MAX_ZIP_BYTES) throw new ZipTooLargeException();
        }
    }

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "202",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ImportContract.AcceptedResponse.class))),
        @ApiResponse(responseCode = "400", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "409", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "422", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface ImportAcceptedResponses {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ImportContract.UploadResponse.class))),
        @ApiResponse(responseCode = "400", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "409", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface UploadResponses {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ImportContract.JobResponse.class))),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface JobResponses {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ImportContract.ApproveResponse.class))),
        @ApiResponse(responseCode = "400", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "409", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface ApproveResponses {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ImportContract.DriftBoardResponse.class))),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface DriftResponses {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ImportContract.PreviewResponse.class))),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface PreviewResponses {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ImportContract.PreviewPagesResponse.class))),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface PreviewPagesResponses {}
}
