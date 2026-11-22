package io.edition.control.adapters.inbound.http.site;

import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.adapters.inbound.http.security.IdempotencyKeyFilter;
import io.edition.control.usecases.hosting.sitedelivery.DeliveryStatusUseCase;
import io.edition.control.usecases.hosting.sitedelivery.RetryDeliveryUseCase;
import io.edition.control.usecases.hosting.sitedelivery.SiteDeliveryTypes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/sites/{siteId}/delivery")
class DeliveryStatusController {
    private final DeliveryStatusUseCase deliveryStatusUseCase;
    private final RetryDeliveryUseCase retryDeliveryUseCase;
    private final BearerCredential bearer;

    DeliveryStatusController(
            DeliveryStatusUseCase deliveryStatusUseCase,
            RetryDeliveryUseCase retryDeliveryUseCase,
            BearerCredential bearer) {
        this.deliveryStatusUseCase = deliveryStatusUseCase;
        this.retryDeliveryUseCase = retryDeliveryUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(
            operationId = "siteDeliveryStatus",
            summary = "Read desired and actual per-site online versions",
            description =
                    "desired identifies the current durable target; current identifies the Reader's actual snapshot. successful requires that exact target online without an access fence. Search status is independent. Reader links use verified hosts and deployment configuration. Poll within a bounded budget; a changed target supersedes an unobserved older target.")
    SiteDeliveryTypes.Status status(@PathVariable UUID tenantId, @PathVariable UUID siteId) {
        return deliveryStatusUseCase.deliveryStatus(bearer.require(), tenantId, siteId);
    }

    @PostMapping("/retry")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "retrySiteDelivery",
            summary = "Retry the existing durable publication without republishing")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    void retry(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @Parameter(hidden = true) HttpServletRequest request) {
        retryDeliveryUseCase.retryDelivery(bearer.require(), tenantId, siteId, IdempotencyKeyFilter.require(request));
    }
}
