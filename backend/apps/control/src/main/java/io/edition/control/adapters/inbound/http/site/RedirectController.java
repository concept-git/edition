package io.edition.control.adapters.inbound.http.site;

import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.adapters.inbound.http.security.IdempotencyKeyFilter;
import io.edition.control.adapters.inbound.http.security.IdempotentReplay;
import io.edition.control.usecases.hosting.reorganization.CreateRedirectUseCase;
import io.edition.control.usecases.hosting.reorganization.DeleteRedirectUseCase;
import io.edition.control.usecases.hosting.reorganization.ListRedirectsUseCase;
import io.edition.control.usecases.hosting.reorganization.ReorganizationTypes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Management HTTP adapter for manual and automatic Redirect rules. */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/sites/{siteId}/redirects")
class RedirectController {
    private final ListRedirectsUseCase listRedirectsUseCase;
    private final CreateRedirectUseCase createRedirectUseCase;
    private final DeleteRedirectUseCase deleteRedirectUseCase;
    private final BearerCredential bearer;

    RedirectController(
            ListRedirectsUseCase listRedirectsUseCase,
            CreateRedirectUseCase createRedirectUseCase,
            DeleteRedirectUseCase deleteRedirectUseCase,
            BearerCredential bearer) {
        this.listRedirectsUseCase = listRedirectsUseCase;
        this.createRedirectUseCase = createRedirectUseCase;
        this.deleteRedirectUseCase = deleteRedirectUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(operationId = "listRedirects", summary = "List Site redirect rules")
    RedirectPageResponse list(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @RequestParam(required = false) @Pattern(regexp = "auto|manual") String origin,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return RedirectPageResponse.from(
                listRedirectsUseCase.listRedirects(bearer.require(), tenantId, siteId, origin, cursor, limit));
    }

    @PostMapping
    @Operation(
            operationId = "createRedirect",
            summary = "Create or replace a manual redirect",
            description =
                    "The target Space must be mounted on this Site. A page target must belong to a mounted Space.")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Current redirect rule",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ReorganizationTypes.RedirectView.class)))
    ResponseEntity<String> create(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @Valid @RequestBody CreateRedirectRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(createRedirectUseCase.createRedirect(
                bearer.require(),
                tenantId,
                siteId,
                body.path(),
                body.targetType(),
                body.targetId(),
                IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "deleteRedirect", summary = "Delete a manual redirect")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    void delete(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @RequestParam @NotBlank String path,
            @Parameter(hidden = true) HttpServletRequest request) {
        deleteRedirectUseCase.deleteRedirect(
                bearer.require(), tenantId, siteId, path, IdempotencyKeyFilter.require(request));
    }

    record CreateRedirectRequest(
            @NotBlank @Size(max = 512) String path,
            @NotBlank @Pattern(regexp = "space|page") String targetType,
            @NotNull UUID targetId) {}

    record RedirectPageResponse(List<RedirectResponse> items, String nextCursor) {
        static RedirectPageResponse from(ReorganizationTypes.RedirectPage value) {
            return new RedirectPageResponse(
                    value.items().stream().map(RedirectResponse::from).toList(), value.nextCursor());
        }
    }

    record RedirectResponse(
            String path,
            UUID targetId,
            String targetType,
            String origin,
            Instant createdAt,
            Long hitCount,
            String currentPath,
            String targetLabel,
            boolean reachable) {
        static RedirectResponse from(ReorganizationTypes.RedirectView value) {
            return new RedirectResponse(
                    value.path(),
                    value.targetId(),
                    value.targetType(),
                    value.origin(),
                    value.createdAt(),
                    value.hitCount(),
                    value.currentPath(),
                    value.targetLabel(),
                    value.reachable());
        }
    }
}
