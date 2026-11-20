package io.space.control.entry.http.release;

import io.space.control.compositions.releases.release.ListTenantReleasesUseCase;
import io.space.control.compositions.releases.release.ReleaseTypes;
import io.space.control.entry.http.security.BearerCredential;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 租户级发版索引：跨空间只读聚合，写动作仍在空间级端点。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/releases")
class TenantReleaseController {
    private final ListTenantReleasesUseCase listTenantReleasesUseCase;
    private final BearerCredential bearer;

    TenantReleaseController(ListTenantReleasesUseCase listTenantReleasesUseCase, BearerCredential bearer) {
        this.listTenantReleasesUseCase = listTenantReleasesUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(operationId = "listTenantReleases", summary = "List Releases across every readable Space of a tenant")
    @ApiResponse(responseCode = "200", description = "One page of releases with their owning spaces")
    @ApiResponse(
            responseCode = "400",
            description = "Malformed cursor (invalid_cursor)",
            content =
                    @Content(
                            mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                            schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    ReleaseContract.TenantPageResponse list(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) UUID spaceId,
            @RequestParam(required = false) @Pattern(regexp = "authored|synced") String mode,
            @RequestParam(required = false) @Pattern(regexp = "draft|flagged|validated|live|archived") String status,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return ReleaseContract.TenantPageResponse.from(listTenantReleasesUseCase.listTenantReleases(
                bearer.require(),
                tenantId,
                ReleaseTypes.TenantReleaseFilter.parse(spaceId, mode, status),
                cursor,
                limit));
    }
}
