package io.space.control.entry.http.permission;

import io.space.control.compositions.authoring.permission.DeleteSiteGrantUseCase;
import io.space.control.compositions.authoring.permission.ExplainSiteAdminUseCase;
import io.space.control.compositions.authoring.permission.ListSitePermissionsUseCase;
import io.space.control.compositions.authoring.permission.PermissionTypes;
import io.space.control.compositions.authoring.permission.PutSiteGrantUseCase;
import io.space.control.compositions.authoring.permission.SearchSitePermissionTeamsUseCase;
import io.space.control.compositions.authoring.permission.SearchSitePermissionUsersUseCase;
import io.space.control.entry.http.security.BearerCredential;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Site permission HTTP adapter；anonymous 仅在此入口可写 reader/none。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/sites/{siteId}")
@SecurityRequirement(name = "bearerAuth")
class SitePermissionController {
    private final ListSitePermissionsUseCase listSitePermissionsUseCase;
    private final SearchSitePermissionUsersUseCase searchSitePermissionUsersUseCase;
    private final SearchSitePermissionTeamsUseCase searchSitePermissionTeamsUseCase;
    private final PutSiteGrantUseCase putSiteGrantUseCase;
    private final DeleteSiteGrantUseCase deleteSiteGrantUseCase;
    private final ExplainSiteAdminUseCase explainSiteAdminUseCase;
    private final BearerCredential bearer;

    SitePermissionController(
            ListSitePermissionsUseCase listSitePermissionsUseCase,
            SearchSitePermissionUsersUseCase searchSitePermissionUsersUseCase,
            SearchSitePermissionTeamsUseCase searchSitePermissionTeamsUseCase,
            PutSiteGrantUseCase putSiteGrantUseCase,
            DeleteSiteGrantUseCase deleteSiteGrantUseCase,
            ExplainSiteAdminUseCase explainSiteAdminUseCase,
            BearerCredential bearer) {
        this.listSitePermissionsUseCase = listSitePermissionsUseCase;
        this.searchSitePermissionUsersUseCase = searchSitePermissionUsersUseCase;
        this.searchSitePermissionTeamsUseCase = searchSitePermissionTeamsUseCase;
        this.putSiteGrantUseCase = putSiteGrantUseCase;
        this.deleteSiteGrantUseCase = deleteSiteGrantUseCase;
        this.explainSiteAdminUseCase = explainSiteAdminUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/permissions")
    @Operation(operationId = "listSitePermissions", summary = "List inherited and local Site grants")
    PermissionTypes.GrantPage list(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listSitePermissionsUseCase.listSitePermissions(bearer.require(), tenantId, siteId, cursor, limit);
    }

    @GetMapping("/permissions/principals/users")
    @Operation(operationId = "searchSitePermissionUsers", summary = "Search active tenant Users for Site ACL")
    PermissionTypes.PrincipalPage users(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @RequestParam @Size(min = 2) String q,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return searchSitePermissionUsersUseCase.searchSitePermissionUsers(
                bearer.require(), tenantId, siteId, q, cursor, limit);
    }

    @GetMapping("/permissions/principals/teams")
    @Operation(operationId = "searchSitePermissionTeams", summary = "Search tenant Teams for Site ACL")
    PermissionTypes.PrincipalPage teams(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @RequestParam @Size(min = 2) String q,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return searchSitePermissionTeamsUseCase.searchSitePermissionTeams(
                bearer.require(), tenantId, siteId, q, cursor, limit);
    }

    @PutMapping("/permissions/grants/{principalKey}")
    @Operation(operationId = "putSiteGrant", summary = "Create or replace a local Site grant")
    PermissionTypes.GrantView putGrant(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable @Pattern(regexp = PermissionPrincipalKeyPattern.VALUE) String principalKey,
            @Valid @RequestBody GrantRequest body) {
        return putSiteGrantUseCase.putSiteGrant(bearer.require(), tenantId, siteId, principalKey, body.role());
    }

    @DeleteMapping("/permissions/grants/{principalKey}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "deleteSiteGrant", summary = "Delete a local Site grant")
    void deleteGrant(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable @Pattern(regexp = PermissionPrincipalKeyPattern.VALUE) String principalKey) {
        deleteSiteGrantUseCase.deleteSiteGrant(bearer.require(), tenantId, siteId, principalKey);
    }

    @GetMapping("/permissions:effective")
    @Operation(operationId = "explainSiteAdmin", summary = "Explain effective Site admin access")
    PermissionTypes.EffectivePermissionView effective(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @RequestParam @Pattern(regexp = PermissionPrincipalKeyPattern.VALUE) String principal) {
        return explainSiteAdminUseCase.explainSiteAdmin(bearer.require(), tenantId, siteId, principal);
    }

    record GrantRequest(@NotBlank String role) {}
}
