package io.space.control.entry.http.platform;

import io.space.control.compositions.platform.mailadmin.ListMailJobsUseCase;
import io.space.control.compositions.platform.mailadmin.MailAdminTypes;
import io.space.control.compositions.platform.mailadmin.RetryMailJobUseCase;
import io.space.control.entry.http.security.BearerCredential;
import io.space.control.entry.http.security.IdempotencyKeyFilter;
import io.space.control.entry.http.security.IdempotentReplay;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
class MailJobsController {
    private final ListMailJobsUseCase listMailJobsUseCase;
    private final RetryMailJobUseCase retryMailJobUseCase;
    private final BearerCredential bearer;

    MailJobsController(
            ListMailJobsUseCase listMailJobsUseCase, RetryMailJobUseCase retryMailJobUseCase, BearerCredential bearer) {
        this.listMailJobsUseCase = listMailJobsUseCase;
        this.retryMailJobUseCase = retryMailJobUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/ops/mail-jobs")
    @Operation(operationId = "listMailJobs", summary = "List masked mail delivery metadata")
    MailAdminTypes.MailJobPage list(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20")
                    @jakarta.validation.constraints.Min(1)
                    @jakarta.validation.constraints.Max(100)
                    int limit) {
        return listMailJobsUseCase.listMailJobs(bearer.require(), tenantId, cursor, limit);
    }

    @PostMapping("/ops/mail-jobs/{id}:retry")
    @Operation(operationId = "retryMailJob", summary = "Replay the original failed mail intent")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Original mail job state after retry request",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = MailAdminTypes.MailJob.class)))
    ResponseEntity<String> retry(
            @PathVariable UUID id, @RequestParam(required = false) UUID tenantId, HttpServletRequest request) {
        return IdempotentReplay.of(retryMailJobUseCase.retryMailJob(
                bearer.require(), tenantId, id, IdempotencyKeyFilter.require(request)));
    }
}
