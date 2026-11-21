package io.edition.control.entry.http.release;

import io.edition.control.compositions.releases.bundleexport.BundleExportTypes;
import io.edition.control.compositions.releases.bundleexport.DownloadExportUseCase;
import io.edition.control.compositions.releases.bundleexport.ListExportsUseCase;
import io.edition.control.compositions.releases.bundleexport.RequestExportUseCase;
import io.edition.control.compositions.releases.bundleexport.RetryExportUseCase;
import io.edition.control.compositions.releases.bundleexport.ViewExportUseCase;
import io.edition.control.entry.http.security.*;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenants/{tenantId}")
class BundleExportController {
    private final RequestExportUseCase requestExportUseCase;
    private final ViewExportUseCase viewExportUseCase;
    private final ListExportsUseCase listExportsUseCase;
    private final RetryExportUseCase retryExportUseCase;
    private final DownloadExportUseCase downloadExportUseCase;
    private final BearerCredential bearer;

    BundleExportController(
            RequestExportUseCase requestExportUseCase,
            ViewExportUseCase viewExportUseCase,
            ListExportsUseCase listExportsUseCase,
            RetryExportUseCase retryExportUseCase,
            DownloadExportUseCase downloadExportUseCase,
            BearerCredential bearer) {
        this.requestExportUseCase = requestExportUseCase;
        this.viewExportUseCase = viewExportUseCase;
        this.listExportsUseCase = listExportsUseCase;
        this.retryExportUseCase = retryExportUseCase;
        this.downloadExportUseCase = downloadExportUseCase;
        this.bearer = bearer;
    }

    @io.swagger.v3.oas.annotations.Parameter(
            name = "Idempotency-Key",
            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
            required = true)
    @PostMapping("/spaces/{spaceId}:export")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "202",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = BundleExportTypes.Job.class)))
    @Operation(
            operationId = "requestBundleExport",
            summary = "Queue a complete portable ZIP for a retained live or archived release")
    ResponseEntity<String> create(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody Request body,
            HttpServletRequest request) {
        return IdempotentReplay.of(requestExportUseCase.requestExport(
                bearer.require(), tenantId, spaceId, body.releaseId(), IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/spaces/{spaceId}/exports")
    @Operation(operationId = "listBundleExports", summary = "List export tasks in this space")
    BundleExportTypes.Jobs list(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestParam(required = false) UUID releaseId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listExportsUseCase.listExports(bearer.require(), tenantId, spaceId, releaseId, cursor, limit);
    }

    @GetMapping("/spaces/{spaceId}/exports/{jobId}")
    @Operation(
            operationId = "viewBundleExport",
            summary = "Read export progress without exposing snapshot or object keys")
    BundleExportTypes.Job view(@PathVariable UUID tenantId, @PathVariable UUID spaceId, @PathVariable UUID jobId) {
        return viewExportUseCase.viewExport(bearer.require(), tenantId, spaceId, jobId);
    }

    @io.swagger.v3.oas.annotations.Parameter(
            name = "Idempotency-Key",
            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
            required = true)
    @PostMapping("/spaces/{spaceId}/exports/{jobId}:retry")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = BundleExportTypes.Job.class)))
    @Operation(
            operationId = "retryBundleExport",
            summary = "Retry the same failed captured export after checking current permissions")
    ResponseEntity<String> retry(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID jobId,
            HttpServletRequest request) {
        return IdempotentReplay.of(retryExportUseCase.retryExport(
                bearer.require(), tenantId, spaceId, jobId, IdempotencyKeyFilter.require(request)));
    }

    @GetMapping(value = "/spaces/{spaceId}/exports/{jobId}/download", produces = "application/zip")
    @Operation(
            operationId = "downloadBundleExport",
            summary = "Reauthorize every current page before streaming the complete private ZIP")
    ResponseEntity<InputStreamResource> download(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @PathVariable UUID jobId) {
        var file = downloadExportUseCase.downloadExport(bearer.require(), tenantId, spaceId, jobId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .contentLength(file.bytes())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(file.filename())
                                .build()
                                .toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.noStore())
                .eTag('"' + file.sha256() + '"')
                .body(new InputStreamResource(file.stream()));
    }

    @io.swagger.v3.oas.annotations.media.Schema(name = "BundleExportRequest")
    record Request(@NotNull UUID releaseId) {}
}
