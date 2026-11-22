package io.edition.control.adapters.inbound.http.platform;

import io.edition.control.adapters.inbound.http.security.*;
import io.edition.control.usecases.platform.pluginmanagement.CompilePluginCandidateUseCase;
import io.edition.control.usecases.platform.pluginmanagement.CreatePluginDevelopmentUseCase;
import io.edition.control.usecases.platform.pluginmanagement.DeletePluginDevelopmentUseCase;
import io.edition.control.usecases.platform.pluginmanagement.ListPluginCandidatesUseCase;
import io.edition.control.usecases.platform.pluginmanagement.ListPluginDevelopmentsUseCase;
import io.edition.control.usecases.platform.pluginmanagement.ListPluginVerificationsUseCase;
import io.edition.control.usecases.platform.pluginmanagement.PluginCatalogUseCase;
import io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes;
import io.edition.control.usecases.platform.pluginmanagement.SavePluginDevelopmentUseCase;
import io.edition.control.usecases.platform.pluginmanagement.VerifyPluginCandidateUseCase;
import io.edition.control.usecases.platform.pluginmanagement.ViewPluginCandidateUseCase;
import io.edition.control.usecases.platform.pluginmanagement.ViewPluginDevelopmentUseCase;
import io.edition.control.usecases.platform.pluginmanagement.ViewPluginVerificationUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenants/{tenantId}")
class ContentPluginController {
    private final PluginCatalogUseCase pluginCatalogUseCase;
    private final ListPluginDevelopmentsUseCase listPluginDevelopmentsUseCase;
    private final ViewPluginDevelopmentUseCase viewPluginDevelopmentUseCase;
    private final CreatePluginDevelopmentUseCase createPluginDevelopmentUseCase;
    private final SavePluginDevelopmentUseCase savePluginDevelopmentUseCase;
    private final DeletePluginDevelopmentUseCase deletePluginDevelopmentUseCase;
    private final CompilePluginCandidateUseCase compilePluginCandidateUseCase;
    private final ListPluginCandidatesUseCase listPluginCandidatesUseCase;
    private final ViewPluginCandidateUseCase viewPluginCandidateUseCase;
    private final VerifyPluginCandidateUseCase verifyPluginCandidateUseCase;
    private final ListPluginVerificationsUseCase listPluginVerificationsUseCase;
    private final ViewPluginVerificationUseCase viewPluginVerificationUseCase;
    private final BearerCredential bearer;

    ContentPluginController(
            PluginCatalogUseCase pluginCatalogUseCase,
            ListPluginDevelopmentsUseCase listPluginDevelopmentsUseCase,
            ViewPluginDevelopmentUseCase viewPluginDevelopmentUseCase,
            CreatePluginDevelopmentUseCase createPluginDevelopmentUseCase,
            SavePluginDevelopmentUseCase savePluginDevelopmentUseCase,
            DeletePluginDevelopmentUseCase deletePluginDevelopmentUseCase,
            CompilePluginCandidateUseCase compilePluginCandidateUseCase,
            ListPluginCandidatesUseCase listPluginCandidatesUseCase,
            ViewPluginCandidateUseCase viewPluginCandidateUseCase,
            VerifyPluginCandidateUseCase verifyPluginCandidateUseCase,
            ListPluginVerificationsUseCase listPluginVerificationsUseCase,
            ViewPluginVerificationUseCase viewPluginVerificationUseCase,
            BearerCredential bearer) {
        this.pluginCatalogUseCase = pluginCatalogUseCase;
        this.listPluginDevelopmentsUseCase = listPluginDevelopmentsUseCase;
        this.viewPluginDevelopmentUseCase = viewPluginDevelopmentUseCase;
        this.createPluginDevelopmentUseCase = createPluginDevelopmentUseCase;
        this.savePluginDevelopmentUseCase = savePluginDevelopmentUseCase;
        this.deletePluginDevelopmentUseCase = deletePluginDevelopmentUseCase;
        this.compilePluginCandidateUseCase = compilePluginCandidateUseCase;
        this.listPluginCandidatesUseCase = listPluginCandidatesUseCase;
        this.viewPluginCandidateUseCase = viewPluginCandidateUseCase;
        this.verifyPluginCandidateUseCase = verifyPluginCandidateUseCase;
        this.listPluginVerificationsUseCase = listPluginVerificationsUseCase;
        this.viewPluginVerificationUseCase = viewPluginVerificationUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/content-plugins")
    @Operation(operationId = "contentPluginCatalog", summary = "Discover trusted build-registered content plugins")
    PluginManagementTypes.Catalog catalog(@PathVariable UUID tenantId) {
        return pluginCatalogUseCase.pluginCatalog(bearer.require(), tenantId);
    }

    @GetMapping("/plugin-developments")
    @Operation(operationId = "listPluginDevelopments", summary = "List tenant plugin source workspaces")
    PluginManagementTypes.DevelopmentList list(@PathVariable UUID tenantId) {
        return listPluginDevelopmentsUseCase.listPluginDevelopments(bearer.require(), tenantId);
    }

    @GetMapping("/plugin-developments/{id}")
    @Operation(operationId = "viewPluginDevelopment", summary = "Read the current source and baseline")
    PluginManagementTypes.Development view(@PathVariable UUID tenantId, @PathVariable UUID id) {
        return viewPluginDevelopmentUseCase.viewPluginDevelopment(bearer.require(), tenantId, id);
    }

    @PostMapping("/plugin-developments")
    @Operation(operationId = "createPluginDevelopment", summary = "Create a tenant-admin plugin source workspace")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            content = @Content(schema = @Schema(implementation = PluginManagementTypes.Development.class)))
    ResponseEntity<String> create(
            @PathVariable UUID tenantId, @Valid @RequestBody Create body, HttpServletRequest request) {
        return IdempotentReplay.of(createPluginDevelopmentUseCase.createPluginDevelopment(
                bearer.require(),
                tenantId,
                body.name(),
                body.contentType(),
                body.source(),
                IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/plugin-developments/{id}")
    @Operation(operationId = "savePluginDevelopment", summary = "Atomically save source using the current baseline")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = PluginManagementTypes.Development.class)))
    ResponseEntity<String> save(
            @PathVariable UUID tenantId,
            @PathVariable UUID id,
            @Valid @RequestBody Save body,
            HttpServletRequest request) {
        return IdempotentReplay.of(savePluginDevelopmentUseCase.savePluginDevelopment(
                bearer.require(),
                tenantId,
                id,
                body.baseRevision(),
                body.name(),
                body.contentType(),
                body.source(),
                IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/plugin-developments/{id}")
    @Operation(
            operationId = "deletePluginDevelopment",
            summary = "Archive the editable source while preserving immutable evidence")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = PluginManagementTypes.Removed.class)))
    ResponseEntity<String> delete(
            @PathVariable UUID tenantId,
            @PathVariable UUID id,
            @RequestParam int baseRevision,
            HttpServletRequest request) {
        return IdempotentReplay.of(deletePluginDevelopmentUseCase.deletePluginDevelopment(
                bearer.require(), tenantId, id, baseRevision, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/plugin-developments/{id}/candidates")
    @Operation(
            operationId = "compilePluginCandidate",
            summary = "Capture an immutable browser-built candidate and recompute its digest")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            content = @Content(schema = @Schema(implementation = PluginManagementTypes.Candidate.class)))
    ResponseEntity<String> compile(
            @PathVariable UUID tenantId,
            @PathVariable UUID id,
            @Valid @RequestBody Compile body,
            HttpServletRequest request) {
        return IdempotentReplay.of(compilePluginCandidateUseCase.compilePluginCandidate(
                bearer.require(),
                tenantId,
                id,
                body.baseRevision(),
                body.sourceDigest(),
                body.entryPoint(),
                body.bundle(),
                body.environment(),
                IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/plugin-developments/{id}/candidates")
    @Operation(operationId = "listPluginCandidates", summary = "List immutable development candidates")
    PluginManagementTypes.CandidateList candidates(@PathVariable UUID tenantId, @PathVariable UUID id) {
        return listPluginCandidatesUseCase.listPluginCandidates(bearer.require(), tenantId, id);
    }

    @GetMapping("/plugin-developments/{id}/candidates/{candidateId}")
    @Operation(
            operationId = "viewPluginCandidate",
            summary = "Read an immutable candidate including captured source and artifact")
    PluginManagementTypes.Candidate candidate(
            @PathVariable UUID tenantId, @PathVariable UUID id, @PathVariable UUID candidateId) {
        return viewPluginCandidateUseCase.viewPluginCandidate(bearer.require(), tenantId, id, candidateId);
    }

    @PostMapping("/plugin-verifications")
    @Operation(
            operationId = "verifyPluginCandidate",
            summary = "Bind browser evidence and independent server validation to candidate fixtures")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            content = @Content(schema = @Schema(implementation = PluginManagementTypes.Verification.class)))
    ResponseEntity<String> verify(
            @PathVariable UUID tenantId, @Valid @RequestBody Verify body, HttpServletRequest request) {
        return IdempotentReplay.of(verifyPluginCandidateUseCase.verifyPluginCandidate(
                bearer.require(),
                tenantId,
                body.developmentId(),
                body.candidateId(),
                body.fixtureDigest(),
                body.environment(),
                body.browserEvidence(),
                IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/plugin-verifications")
    @Operation(operationId = "listPluginVerifications", summary = "List immutable verification evidence")
    PluginManagementTypes.VerificationList verifications(
            @PathVariable UUID tenantId, @RequestParam(required = false) UUID developmentId) {
        return listPluginVerificationsUseCase.listPluginVerifications(bearer.require(), tenantId, developmentId);
    }

    @GetMapping("/plugin-verifications/{id}")
    @Operation(
            operationId = "viewPluginVerification",
            summary = "Read browser evidence separately from server authority")
    PluginManagementTypes.Verification verification(@PathVariable UUID tenantId, @PathVariable UUID id) {
        return viewPluginVerificationUseCase.viewPluginVerification(bearer.require(), tenantId, id);
    }

    record Create(
            @NotBlank String name,
            @NotBlank String contentType,
            @NotNull PluginManagementTypes.Source source) {}

    record Save(
            @Min(1) int baseRevision,
            @NotBlank String name,
            @NotBlank String contentType,
            @NotNull PluginManagementTypes.Source source) {}

    record Compile(
            @Min(1) int baseRevision,
            @NotBlank String sourceDigest,
            @NotBlank String entryPoint,
            @NotBlank String bundle,
            @NotBlank String environment) {}

    record Verify(
            @NotNull UUID developmentId,
            @NotNull UUID candidateId,
            @NotBlank String fixtureDigest,
            @NotBlank String environment,
            @NotNull PluginManagementTypes.Evidence browserEvidence) {}
}
