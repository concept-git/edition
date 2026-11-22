package io.edition.control.adapters.inbound.http.platform;

import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.usecases.platform.tenant.ListTenantsUseCase;
import io.edition.control.usecases.platform.tenant.ProvisionTenantUseCase;
import io.edition.control.usecases.platform.tenant.ResumeTenantUseCase;
import io.edition.control.usecases.platform.tenant.SuspendTenantUseCase;
import io.edition.control.usecases.platform.tenant.TenantTypes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * 平台运维面：租户开通与冻结。只对平台运营员开放（403 platform_operator_required）。
 * controller 只做 DTO ↔ flow 翻译——资源链与 guard 全在 sync 内部。
 */
@RestController
@RequestMapping("/admin/tenants")
@SecurityRequirement(name = "bearerAuth")
@ApiResponse(
        responseCode = "401",
        description = "Missing, expired or revoked session (authentication_required)",
        content =
                @Content(
                        mediaType = AdminTenantController.PROBLEM,
                        schema = @Schema(ref = "#/components/schemas/ApiProblem")))
@ApiResponse(
        responseCode = "403",
        description = "Caller is not a platform operator (platform_operator_required)",
        content =
                @Content(
                        mediaType = AdminTenantController.PROBLEM,
                        schema = @Schema(ref = "#/components/schemas/ApiProblem")))
class AdminTenantController {

    static final String PROBLEM = "application/problem+json";

    private final ProvisionTenantUseCase provisionTenantUseCase;
    private final ListTenantsUseCase listTenantsUseCase;
    private final SuspendTenantUseCase suspendTenantUseCase;
    private final ResumeTenantUseCase resumeTenantUseCase;
    private final BearerCredential bearer;

    AdminTenantController(
            ProvisionTenantUseCase provisionTenantUseCase,
            ListTenantsUseCase listTenantsUseCase,
            SuspendTenantUseCase suspendTenantUseCase,
            ResumeTenantUseCase resumeTenantUseCase,
            BearerCredential bearer) {
        this.provisionTenantUseCase = provisionTenantUseCase;
        this.listTenantsUseCase = listTenantsUseCase;
        this.suspendTenantUseCase = suspendTenantUseCase;
        this.resumeTenantUseCase = resumeTenantUseCase;
        this.bearer = bearer;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            operationId = "provisionTenant",
            summary = "Provision a tenant and seat its first owner",
            description = "Registers the tenant and seats ownerEmail as owner in one transaction. "
                    + "When that email has no verified account yet an owner invite is issued instead, and its "
                    + "one-time token is returned so the operator can pass the link on.")
    @ApiResponse(responseCode = "201", description = "Tenant provisioned")
    @ApiResponse(
            responseCode = "422",
            description = "Blank or over-long name (tenant_name_invalid)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    TenantTypes.Provisioned provision(@Valid @RequestBody ProvisionTenantRequest request) {
        return provisionTenantUseCase.provisionTenant(bearer.require(), request.name(), request.ownerEmail());
    }

    @GetMapping
    @Operation(
            operationId = "listTenants",
            summary = "List tenants",
            description = "Cursor paginated by provisioning time. The cursor is opaque; pass nextCursor verbatim.")
    @ApiResponse(responseCode = "200", description = "One page of tenants")
    @ApiResponse(
            responseCode = "400",
            description = "Malformed cursor (invalid_cursor)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    TenantTypes.Tenants list(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listTenantsUseCase.listTenants(bearer.require(), cursor, limit);
    }

    @PostMapping("/{id}:suspend")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "suspendTenant",
            summary = "Freeze a tenant",
            description = "Idempotent. Freezes tenant-scoped management operations only: sessions stay alive, "
                    + "the same user keeps working in other tenants, and the platform plane is exempt.")
    @ApiResponse(
            responseCode = "404",
            description = "Unknown tenant (tenant_not_found)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    void suspend(@PathVariable UUID id) {
        suspendTenantUseCase.suspendTenant(bearer.require(), id);
    }

    @PostMapping("/{id}:resume")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "resumeTenant", summary = "Unfreeze a tenant", description = "Idempotent.")
    @ApiResponse(
            responseCode = "404",
            description = "Unknown tenant (tenant_not_found)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    void resume(@PathVariable UUID id) {
        resumeTenantUseCase.resumeTenant(bearer.require(), id);
    }

    record ProvisionTenantRequest(
            @NotBlank String name, @NotBlank @Email String ownerEmail) {}
}
