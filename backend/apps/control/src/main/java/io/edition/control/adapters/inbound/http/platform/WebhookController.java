package io.edition.control.adapters.inbound.http.platform;

import io.edition.control.adapters.inbound.http.security.*;
import io.edition.control.usecases.platform.webhook.CreateWebhookUseCase;
import io.edition.control.usecases.platform.webhook.ListDeliveriesUseCase;
import io.edition.control.usecases.platform.webhook.ListWebhooksUseCase;
import io.edition.control.usecases.platform.webhook.RedeliverUseCase;
import io.edition.control.usecases.platform.webhook.RotateWebhookUseCase;
import io.edition.control.usecases.platform.webhook.UpdateWebhookUseCase;
import io.edition.control.usecases.platform.webhook.WebhookTypes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks")
class WebhookController {
    private final ListWebhooksUseCase listWebhooksUseCase;
    private final CreateWebhookUseCase createWebhookUseCase;
    private final UpdateWebhookUseCase updateWebhookUseCase;
    private final RotateWebhookUseCase rotateWebhookUseCase;
    private final ListDeliveriesUseCase listDeliveriesUseCase;
    private final RedeliverUseCase redeliverUseCase;
    private final BearerCredential bearer;

    WebhookController(
            ListWebhooksUseCase listWebhooksUseCase,
            CreateWebhookUseCase createWebhookUseCase,
            UpdateWebhookUseCase updateWebhookUseCase,
            RotateWebhookUseCase rotateWebhookUseCase,
            ListDeliveriesUseCase listDeliveriesUseCase,
            RedeliverUseCase redeliverUseCase,
            BearerCredential bearer) {
        this.listWebhooksUseCase = listWebhooksUseCase;
        this.createWebhookUseCase = createWebhookUseCase;
        this.updateWebhookUseCase = updateWebhookUseCase;
        this.rotateWebhookUseCase = rotateWebhookUseCase;
        this.listDeliveriesUseCase = listDeliveriesUseCase;
        this.redeliverUseCase = redeliverUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(operationId = "listWebhooks", summary = "List tenant webhook subscriptions without secrets")
    WebhookTypes.SubscriptionPage list(
            @RequestParam UUID tenantId,
            @RequestParam(required = false) UUID cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listWebhooksUseCase.listWebhooks(bearer.require(), tenantId, cursor, limit);
    }

    @PostMapping
    @Operation(operationId = "createWebhook", summary = "Create a signed webhook subscription")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            content = @Content(schema = @Schema(implementation = WebhookTypes.SecretResult.class)))
    ResponseEntity<String> create(
            @RequestParam UUID tenantId, @Valid @RequestBody WebhookConfiguration body, HttpServletRequest request) {
        return IdempotentReplay.of(createWebhookUseCase.createWebhook(
                bearer.require(), tenantId, body.configuration(), IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/{id}")
    @Operation(operationId = "updateWebhook", summary = "Edit or disable a webhook subscription")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = WebhookTypes.Subscription.class)))
    ResponseEntity<String> update(
            @RequestParam UUID tenantId,
            @PathVariable UUID id,
            @Valid @RequestBody WebhookConfiguration body,
            HttpServletRequest request) {
        return IdempotentReplay.of(updateWebhookUseCase.updateWebhook(
                bearer.require(), tenantId, id, body.configuration(), IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/{id}:rotate")
    @Operation(operationId = "rotateWebhook", summary = "Rotate the signing secret; returned once")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = WebhookTypes.SecretResult.class)))
    ResponseEntity<String> rotate(@RequestParam UUID tenantId, @PathVariable UUID id, HttpServletRequest request) {
        return IdempotentReplay.of(rotateWebhookUseCase.rotateWebhook(
                bearer.require(), tenantId, id, IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/{id}/deliveries")
    @Operation(operationId = "listWebhookDeliveries", summary = "Inspect delivery state and attempts")
    WebhookTypes.DeliveryPage deliveries(
            @RequestParam UUID tenantId,
            @PathVariable UUID id,
            @RequestParam(required = false) UUID cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listDeliveriesUseCase.listDeliveries(bearer.require(), tenantId, id, cursor, limit);
    }

    @PostMapping("/{id}/deliveries/{deliveryId}:redeliver")
    @Operation(operationId = "redeliverWebhook", summary = "Redeliver the same event with a new attempt")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    void redeliver(
            @RequestParam UUID tenantId,
            @PathVariable UUID id,
            @PathVariable UUID deliveryId,
            HttpServletRequest request) {
        redeliverUseCase.redeliver(bearer.require(), tenantId, id, deliveryId, IdempotencyKeyFilter.require(request));
    }

    record WebhookConfiguration(
            @NotBlank @Size(max = 2048) String url,
            @NotNull @Pattern(regexp = "tenant|space|site") String scopeType,
            UUID scopeId,
            @NotEmpty Set<@NotBlank String> events,
            boolean active) {
        WebhookTypes.Configuration configuration() {
            return new WebhookTypes.Configuration(url, scopeType, scopeId, events, active);
        }
    }
}
