package io.edition.control.entry.http.platform;

import io.edition.control.compositions.authoring.termination.TerminationTypes;
import io.edition.control.compositions.platform.operations.CapabilitiesUseCase;
import io.edition.control.compositions.platform.operations.DownloadAuditExportUseCase;
import io.edition.control.compositions.platform.operations.ExportAuditUseCase;
import io.edition.control.compositions.platform.operations.ListAuditUseCase;
import io.edition.control.compositions.platform.operations.ListJobsUseCase;
import io.edition.control.compositions.platform.operations.OperationsTypes;
import io.edition.control.compositions.platform.operations.PurgeTrashUseCase;
import io.edition.control.compositions.platform.operations.RetryJobUseCase;
import io.edition.control.compositions.platform.operations.RetryStorageUseCase;
import io.edition.control.compositions.platform.operations.StorageUsageUseCase;
import io.edition.control.compositions.platform.operations.ViewAuditExportUseCase;
import io.edition.control.entry.http.security.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
class OperationsController {
    private final RetryStorageUseCase retryStorageUseCase;
    private final StorageUsageUseCase storageUsageUseCase;
    private final CapabilitiesUseCase capabilitiesUseCase;
    private final ListAuditUseCase listAuditUseCase;
    private final ListJobsUseCase listJobsUseCase;
    private final RetryJobUseCase retryJobUseCase;
    private final PurgeTrashUseCase purgeTrashUseCase;
    private final ExportAuditUseCase exportAuditUseCase;
    private final ViewAuditExportUseCase viewAuditExportUseCase;
    private final DownloadAuditExportUseCase downloadAuditExportUseCase;
    private final BearerCredential bearer;

    OperationsController(
            RetryStorageUseCase retryStorageUseCase,
            StorageUsageUseCase storageUsageUseCase,
            CapabilitiesUseCase capabilitiesUseCase,
            ListAuditUseCase listAuditUseCase,
            ListJobsUseCase listJobsUseCase,
            RetryJobUseCase retryJobUseCase,
            PurgeTrashUseCase purgeTrashUseCase,
            ExportAuditUseCase exportAuditUseCase,
            ViewAuditExportUseCase viewAuditExportUseCase,
            DownloadAuditExportUseCase downloadAuditExportUseCase,
            BearerCredential bearer) {
        this.retryStorageUseCase = retryStorageUseCase;
        this.storageUsageUseCase = storageUsageUseCase;
        this.capabilitiesUseCase = capabilitiesUseCase;
        this.listAuditUseCase = listAuditUseCase;
        this.listJobsUseCase = listJobsUseCase;
        this.retryJobUseCase = retryJobUseCase;
        this.purgeTrashUseCase = purgeTrashUseCase;
        this.exportAuditUseCase = exportAuditUseCase;
        this.viewAuditExportUseCase = viewAuditExportUseCase;
        this.downloadAuditExportUseCase = downloadAuditExportUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/api/v1/tenants/{tenantId}/operations")
    @Operation(operationId = "operationsCapabilities", summary = "List the current actor's operational capabilities")
    OperationsTypes.Capabilities capabilities(@PathVariable UUID tenantId) {
        return capabilitiesUseCase.capabilities(bearer.require(), tenantId);
    }

    @PostMapping("/ops/storage:retry")
    @Operation(
            operationId = "retryStorage",
            summary = "Requeue failed source cleanup without bypassing reference protection")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "202",
            content = @Content(schema = @Schema(implementation = OperationsTypes.StorageRetry.class)))
    ResponseEntity<String> retryStorage(HttpServletRequest request) {
        return IdempotentReplay.of(
                retryStorageUseCase.retryStorage(bearer.require(), IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/ops/storage")
    @Operation(operationId = "storageUsage", summary = "Inspect platform physical source storage and database size")
    OperationsTypes.StorageUsage storage() {
        return storageUsageUseCase.storageUsage(bearer.require());
    }

    @GetMapping("/audit")
    @Operation(operationId = "listAudit", summary = "Query tenant or platform audit facts")
    OperationsTypes.AuditPage audit(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(required = false) UUID actor,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) UUID target,
            @RequestParam(required = false) String outcome,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listAuditUseCase.listAudit(
                bearer.require(),
                tenantId,
                new OperationsTypes.AuditFilter(actor, action, target, outcome, from, to, cursor),
                limit);
    }

    @GetMapping("/ops/jobs")
    @Operation(operationId = "listJobs", summary = "Inspect import work and recovery state")
    OperationsTypes.JobPage jobs(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(required = false) UUID spaceId,
            @RequestParam(defaultValue = "import") @Pattern(regexp = "import") String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listJobsUseCase.listJobs(bearer.require(), tenantId, spaceId, status, cursor, limit);
    }

    @PostMapping("/ops/jobs/{jobId}:retry")
    @Operation(operationId = "retryJob", summary = "Retry a failed import with current publish authorization")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    void retry(@PathVariable UUID jobId, @Valid @RequestBody RetryRequest body, HttpServletRequest request) {
        retryJobUseCase.retryJob(
                bearer.require(), body.tenantId(), jobId, IdempotencyKeyFilter.require(request), body.platform());
    }

    @PostMapping("/ops/trash:purge")
    @Operation(operationId = "purgeTrash", summary = "Scan expired trash without bypassing reference protection")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = TerminationTypes.PurgeReport.class)))
    ResponseEntity<String> purge(@Valid @RequestBody TenantRequest body, HttpServletRequest request) {
        return IdempotentReplay.of(
                purgeTrashUseCase.purgeTrash(bearer.require(), body.tenantId(), IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/audit:export")
    @Operation(operationId = "exportAudit", summary = "Create a snapshot CSV export of all filtered audit records")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "202",
            content = @Content(schema = @Schema(implementation = OperationsTypes.ExportStatus.class)))
    ResponseEntity<String> export(@Valid @RequestBody ExportRequest body, HttpServletRequest request) {
        return IdempotentReplay.of(exportAuditUseCase.exportAudit(
                bearer.require(), body.tenantId(), body.filter(), IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/audit/exports/{id}")
    @Operation(operationId = "viewAuditExport", summary = "Inspect export generation state")
    OperationsTypes.ExportStatus exportStatus(@RequestParam(required = false) UUID tenantId, @PathVariable UUID id) {
        return viewAuditExportUseCase.viewAuditExport(bearer.require(), tenantId, id);
    }

    @GetMapping("/audit/exports/{id}/content")
    @Operation(operationId = "downloadAuditExport", summary = "Download an export after checking current authorization")
    @ApiResponse(
            responseCode = "200",
            content = @Content(mediaType = "text/csv", schema = @Schema(type = "string", format = "binary")))
    ResponseEntity<org.springframework.core.io.Resource> exportContent(
            @RequestParam(required = false) UUID tenantId, @PathVariable UUID id) {
        var result = downloadAuditExportUseCase.downloadAuditExport(bearer.require(), tenantId, id);
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv; charset=utf-8")
                .header("Cache-Control", "private, no-store")
                .header(
                        "Content-Disposition",
                        org.springframework.http.ContentDisposition.attachment()
                                .filename(result.filename())
                                .build()
                                .toString())
                .body(new org.springframework.core.io.InputStreamResource(result.stream()));
    }

    record ExportRequest(UUID tenantId, @NotNull OperationsTypes.AuditFilter filter) {}

    record RetryRequest(@NotNull UUID tenantId, boolean platform) {}

    record TenantRequest(@NotNull UUID tenantId) {}
}
