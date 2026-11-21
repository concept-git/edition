package io.edition.control.entry.http.site;

import io.edition.control.compositions.hosting.customdomain.ListDomainsUseCase;
import io.edition.control.entry.http.security.BearerCredential;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 租户级域名索引：跨站点只读聚合；绑定 / 核验 / 设主 / 解绑仍走站点嵌套端点。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/domains")
class TenantDomainController {
    private final ListDomainsUseCase listDomainsUseCase;
    private final BearerCredential bearer;

    TenantDomainController(ListDomainsUseCase listDomainsUseCase, BearerCredential bearer) {
        this.listDomainsUseCase = listDomainsUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(
            operationId = "listTenantDomains",
            summary = "List custom domains across every readable Site of a tenant")
    @ApiResponse(responseCode = "200", description = "One page of domains with their owning sites")
    @ApiResponse(
            responseCode = "400",
            description = "Malformed cursor (invalid_cursor)",
            content =
                    @Content(
                            mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                            schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    DomainContract.TenantPageResponse list(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) UUID siteId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return DomainContract.TenantPageResponse.from(
                listDomainsUseCase.listDomains(bearer.require(), tenantId, Optional.ofNullable(siteId), cursor, limit));
    }
}
