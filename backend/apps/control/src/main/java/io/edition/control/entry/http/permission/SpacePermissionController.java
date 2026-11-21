package io.edition.control.entry.http.permission;

import io.edition.control.compositions.authoring.permission.DeleteSpaceGrantUseCase;
import io.edition.control.compositions.authoring.permission.ListPermissionPagesUseCase;
import io.edition.control.compositions.authoring.permission.ListSpacePermissionsUseCase;
import io.edition.control.compositions.authoring.permission.PermissionTypes;
import io.edition.control.compositions.authoring.permission.PutSpaceGrantUseCase;
import io.edition.control.compositions.authoring.permission.SearchPermissionTeamsUseCase;
import io.edition.control.compositions.authoring.permission.SearchPermissionUsersUseCase;
import io.edition.control.entry.http.security.BearerCredential;
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

/** Space permission HTTP adapter；principalKey 始终携类型，禁止用裸 UUID 猜主体。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions")
@SecurityRequirement(name = "bearerAuth")
class SpacePermissionController {
    private final SearchPermissionUsersUseCase searchPermissionUsersUseCase;
    private final SearchPermissionTeamsUseCase searchPermissionTeamsUseCase;
    private final ListPermissionPagesUseCase listPermissionPagesUseCase;
    private final ListSpacePermissionsUseCase listSpacePermissionsUseCase;
    private final PutSpaceGrantUseCase putSpaceGrantUseCase;
    private final DeleteSpaceGrantUseCase deleteSpaceGrantUseCase;
    private final BearerCredential bearer;

    SpacePermissionController(
            SearchPermissionUsersUseCase searchPermissionUsersUseCase,
            SearchPermissionTeamsUseCase searchPermissionTeamsUseCase,
            ListPermissionPagesUseCase listPermissionPagesUseCase,
            ListSpacePermissionsUseCase listSpacePermissionsUseCase,
            PutSpaceGrantUseCase putSpaceGrantUseCase,
            DeleteSpaceGrantUseCase deleteSpaceGrantUseCase,
            BearerCredential bearer) {
        this.searchPermissionUsersUseCase = searchPermissionUsersUseCase;
        this.searchPermissionTeamsUseCase = searchPermissionTeamsUseCase;
        this.listPermissionPagesUseCase = listPermissionPagesUseCase;
        this.listSpacePermissionsUseCase = listSpacePermissionsUseCase;
        this.putSpaceGrantUseCase = putSpaceGrantUseCase;
        this.deleteSpaceGrantUseCase = deleteSpaceGrantUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(operationId = "listSpacePermissions", summary = "List inherited and local Space grants")
    PermissionTypes.GrantPage list(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listSpacePermissionsUseCase.listSpacePermissions(bearer.require(), tenantId, spaceId, cursor, limit);
    }

    @GetMapping("/principals/users")
    @Operation(operationId = "searchPermissionUsers", summary = "Search active tenant Users for ACL editing")
    PermissionTypes.PrincipalPage users(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestParam @Size(min = 2) String q,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return searchPermissionUsersUseCase.searchPermissionUsers(
                bearer.require(), tenantId, spaceId, q, cursor, limit);
    }

    @GetMapping("/principals/teams")
    @Operation(operationId = "searchPermissionTeams", summary = "Search tenant Teams for ACL editing")
    PermissionTypes.PrincipalPage teams(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestParam @Size(min = 2) String q,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return searchPermissionTeamsUseCase.searchPermissionTeams(
                bearer.require(), tenantId, spaceId, q, cursor, limit);
    }

    @GetMapping("/pages")
    @Operation(operationId = "listPermissionPages", summary = "List every Page for ACL administration")
    PermissionTypes.PermissionPage pages(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listPermissionPagesUseCase.listPermissionPages(bearer.require(), tenantId, spaceId, cursor, limit);
    }

    @PutMapping("/grants/{principalKey}")
    @Operation(operationId = "putSpaceGrant", summary = "Create or replace a local Space grant")
    PermissionTypes.GrantView putGrant(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable @Pattern(regexp = PermissionPrincipalKeyPattern.VALUE) String principalKey,
            @Valid @RequestBody GrantRequest body) {
        return putSpaceGrantUseCase.putSpaceGrant(bearer.require(), tenantId, spaceId, principalKey, body.role());
    }

    @DeleteMapping("/grants/{principalKey}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "deleteSpaceGrant", summary = "Delete a local Space grant")
    void deleteGrant(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable @Pattern(regexp = PermissionPrincipalKeyPattern.VALUE) String principalKey) {
        deleteSpaceGrantUseCase.deleteSpaceGrant(bearer.require(), tenantId, spaceId, principalKey);
    }

    record GrantRequest(@NotBlank String role) {}
}
