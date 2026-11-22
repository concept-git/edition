package io.edition.control.adapters.inbound.http.space;

import io.edition.control.adapters.inbound.http.problem.ApiProblem;
import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.adapters.inbound.http.security.IdempotencyKeyFilter;
import io.edition.control.adapters.inbound.http.security.IdempotentReplay;
import io.edition.control.usecases.authoring.termination.DeleteSiteUseCase;
import io.edition.control.usecases.authoring.termination.DeleteSpaceUseCase;
import io.edition.control.usecases.authoring.termination.ListDeletionsUseCase;
import io.edition.control.usecases.authoring.termination.PlanSiteTerminationUseCase;
import io.edition.control.usecases.authoring.termination.PlanSpaceTerminationUseCase;
import io.edition.control.usecases.authoring.termination.RetryDeletionUseCase;
import io.edition.control.usecases.authoring.termination.TerminationTypes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenants/{tenantId}")
class TerminationController {
    private final DeleteSpaceUseCase deleteSpaceUseCase;
    private final DeleteSiteUseCase deleteSiteUseCase;
    private final PlanSpaceTerminationUseCase planSpaceTerminationUseCase;
    private final PlanSiteTerminationUseCase planSiteTerminationUseCase;
    private final ListDeletionsUseCase listDeletionsUseCase;
    private final RetryDeletionUseCase retryDeletionUseCase;
    private final BearerCredential bearer;

    TerminationController(
            DeleteSpaceUseCase deleteSpaceUseCase,
            DeleteSiteUseCase deleteSiteUseCase,
            PlanSpaceTerminationUseCase planSpaceTerminationUseCase,
            PlanSiteTerminationUseCase planSiteTerminationUseCase,
            ListDeletionsUseCase listDeletionsUseCase,
            RetryDeletionUseCase retryDeletionUseCase,
            BearerCredential bearer) {
        this.deleteSpaceUseCase = deleteSpaceUseCase;
        this.deleteSiteUseCase = deleteSiteUseCase;
        this.planSpaceTerminationUseCase = planSpaceTerminationUseCase;
        this.planSiteTerminationUseCase = planSiteTerminationUseCase;
        this.listDeletionsUseCase = listDeletionsUseCase;
        this.retryDeletionUseCase = retryDeletionUseCase;
        this.bearer = bearer;
    }

    @DeleteMapping("/spaces/{spaceId}")
    @Operation(operationId = "deleteSpace", summary = "Permanently delete an archived Space with name confirmation")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = TerminationTypes.Deletion.class)))
    @ApiResponse(
            responseCode = "409",
            content =
                    @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
    ResponseEntity<String> space(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody Confirmation body,
            HttpServletRequest request) {
        return IdempotentReplay.of(deleteSpaceUseCase.deleteSpace(
                bearer.require(), tenantId, spaceId, body.confirmationName(), IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/sites/{siteId}")
    @Operation(operationId = "deleteSite", summary = "Delete an unmounted Site and unbind its domains")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = TerminationTypes.Deletion.class)))
    @ApiResponse(
            responseCode = "409",
            content =
                    @Content(
                            mediaType = "application/problem+json",
                            schema = @Schema(implementation = ApiProblem.class)))
    ResponseEntity<String> site(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @Valid @RequestBody Confirmation body,
            HttpServletRequest request) {
        return IdempotentReplay.of(deleteSiteUseCase.deleteSite(
                bearer.require(), tenantId, siteId, body.confirmationName(), IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/spaces/{spaceId}:deletion-plan")
    @Operation(
            operationId = "planSpaceTermination",
            summary = "Validate current Space termination prerequisites and observe cascade impact without mutation")
    TerminationTypes.TerminationPlan planSpace(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @RequestParam String confirmationName) {
        return planSpaceTerminationUseCase.planSpaceTermination(bearer.require(), tenantId, spaceId, confirmationName);
    }

    @GetMapping("/sites/{siteId}:deletion-plan")
    @Operation(
            operationId = "planSiteTermination",
            summary = "Validate current Site termination prerequisites and observe cascade impact without mutation")
    TerminationTypes.TerminationPlan planSite(
            @PathVariable UUID tenantId, @PathVariable UUID siteId, @RequestParam String confirmationName) {
        return planSiteTerminationUseCase.planSiteTermination(bearer.require(), tenantId, siteId, confirmationName);
    }

    @GetMapping("/deletions")
    @Operation(operationId = "listDeletions", summary = "Query deletion cleanup even after the resource is gone")
    TerminationTypes.DeletionPage list(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) UUID cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listDeletionsUseCase.listDeletions(bearer.require(), tenantId, cursor, limit);
    }

    @PostMapping("/deletions/{resourceId}:retry")
    @Operation(operationId = "retryDeletion", summary = "Retry the original cleanup and delivery intentions")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    void retry(@PathVariable UUID tenantId, @PathVariable UUID resourceId, HttpServletRequest request) {
        retryDeletionUseCase.retryDeletion(
                bearer.require(), tenantId, resourceId, IdempotencyKeyFilter.require(request));
    }

    record Confirmation(@NotBlank @Size(max = 200) String confirmationName) {}
}
