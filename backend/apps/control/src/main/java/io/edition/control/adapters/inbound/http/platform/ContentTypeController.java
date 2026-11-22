package io.edition.control.adapters.inbound.http.platform;

import io.edition.content.ContentTypeDefinition;
import io.edition.control.adapters.inbound.http.security.*;
import io.edition.control.usecases.platform.contenttype.ActivateContentTypeUseCase;
import io.edition.control.usecases.platform.contenttype.ContentTypeTypes;
import io.edition.control.usecases.platform.contenttype.DeactivateContentTypeUseCase;
import io.edition.control.usecases.platform.contenttype.ListContentTypeVersionsUseCase;
import io.edition.control.usecases.platform.contenttype.ListContentTypesUseCase;
import io.edition.control.usecases.platform.contenttype.RegisterContentTypeVersionUseCase;
import io.edition.control.usecases.platform.contenttype.ViewContentTypeVersionUseCase;
import io.swagger.v3.oas.annotations.*;
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
@RequestMapping("/api/v1/tenants/{tenantId}/content-types")
class ContentTypeController {
    private final ListContentTypesUseCase listContentTypesUseCase;
    private final ListContentTypeVersionsUseCase listContentTypeVersionsUseCase;
    private final ViewContentTypeVersionUseCase viewContentTypeVersionUseCase;
    private final RegisterContentTypeVersionUseCase registerContentTypeVersionUseCase;
    private final ActivateContentTypeUseCase activateContentTypeUseCase;
    private final DeactivateContentTypeUseCase deactivateContentTypeUseCase;
    private final BearerCredential bearer;

    ContentTypeController(
            ListContentTypesUseCase listContentTypesUseCase,
            ListContentTypeVersionsUseCase listContentTypeVersionsUseCase,
            ViewContentTypeVersionUseCase viewContentTypeVersionUseCase,
            RegisterContentTypeVersionUseCase registerContentTypeVersionUseCase,
            ActivateContentTypeUseCase activateContentTypeUseCase,
            DeactivateContentTypeUseCase deactivateContentTypeUseCase,
            BearerCredential bearer) {
        this.listContentTypesUseCase = listContentTypesUseCase;
        this.listContentTypeVersionsUseCase = listContentTypeVersionsUseCase;
        this.viewContentTypeVersionUseCase = viewContentTypeVersionUseCase;
        this.registerContentTypeVersionUseCase = registerContentTypeVersionUseCase;
        this.activateContentTypeUseCase = activateContentTypeUseCase;
        this.deactivateContentTypeUseCase = deactivateContentTypeUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(
            operationId = "listContentTypes",
            summary = "Discover tenant content types and selected definition versions")
    ContentTypeTypes.TypeList list(@PathVariable UUID tenantId) {
        return listContentTypesUseCase.listContentTypes(bearer.require(), tenantId);
    }

    @GetMapping("/versions")
    @Operation(operationId = "listContentTypeVersions", summary = "List immutable definition metadata")
    ContentTypeTypes.VersionList versions(@PathVariable UUID tenantId, @RequestParam String contentType) {
        return listContentTypeVersionsUseCase.listContentTypeVersions(bearer.require(), tenantId, contentType);
    }

    @GetMapping("/versions/{versionRef}")
    @Operation(
            operationId = "viewContentTypeVersion",
            summary = "Read one complete immutable definition and schema closure")
    ContentTypeTypes.Version view(@PathVariable UUID tenantId, @PathVariable String versionRef) {
        return viewContentTypeVersionUseCase.viewContentTypeVersion(bearer.require(), tenantId, versionRef);
    }

    @PostMapping("/versions")
    @Operation(operationId = "registerContentTypeVersion", summary = "Register a new immutable content type definition")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            content = @Content(schema = @Schema(implementation = ContentTypeTypes.Version.class)))
    ResponseEntity<String> register(
            @PathVariable UUID tenantId, @Valid @RequestBody Register body, HttpServletRequest request) {
        return IdempotentReplay.of(registerContentTypeVersionUseCase.registerContentTypeVersion(
                bearer.require(),
                tenantId,
                body.contentType(),
                body.baseRevision(),
                body.definition(),
                IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/activate")
    @Operation(operationId = "activateContentType", summary = "Enable a content type and select its default definition")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = ContentTypeTypes.State.class)))
    ResponseEntity<String> activate(
            @PathVariable UUID tenantId, @Valid @RequestBody Activate body, HttpServletRequest request) {
        return IdempotentReplay.of(activateContentTypeUseCase.activateContentType(
                bearer.require(),
                tenantId,
                body.contentType(),
                body.baseRevision(),
                body.versionRef(),
                IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/deactivate")
    @Operation(
            operationId = "deactivateContentType",
            summary = "Disable future selection and publication without changing history")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = ContentTypeTypes.State.class)))
    ResponseEntity<String> deactivate(
            @PathVariable UUID tenantId, @Valid @RequestBody Deactivate body, HttpServletRequest request) {
        return IdempotentReplay.of(deactivateContentTypeUseCase.deactivateContentType(
                bearer.require(),
                tenantId,
                body.contentType(),
                body.baseRevision(),
                IdempotencyKeyFilter.require(request)));
    }

    record Register(
            @NotBlank String contentType,
            @Min(0) int baseRevision,
            @NotNull ContentTypeDefinition definition) {}

    record Activate(
            @NotBlank String contentType,
            @Min(0) int baseRevision,
            @NotBlank String versionRef) {}

    record Deactivate(@NotBlank String contentType, @Min(0) int baseRevision) {}
}
