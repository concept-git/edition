package io.edition.control.adapters.inbound.http.permission;

import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.usecases.authoring.permission.DeletePageRestrictionUseCase;
import io.edition.control.usecases.authoring.permission.ExplainPageReadUseCase;
import io.edition.control.usecases.authoring.permission.PermissionTypes;
import io.edition.control.usecases.authoring.permission.PutPageRestrictionUseCase;
import io.edition.control.usecases.authoring.permission.ViewPagePermissionUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Page restriction/effective HTTP adapter；Page 没有 grant 入口。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}")
@SecurityRequirement(name = "bearerAuth")
class PagePermissionController {
    private final ViewPagePermissionUseCase viewPagePermissionUseCase;
    private final PutPageRestrictionUseCase putPageRestrictionUseCase;
    private final DeletePageRestrictionUseCase deletePageRestrictionUseCase;
    private final ExplainPageReadUseCase explainPageReadUseCase;
    private final BearerCredential bearer;

    PagePermissionController(
            ViewPagePermissionUseCase viewPagePermissionUseCase,
            PutPageRestrictionUseCase putPageRestrictionUseCase,
            DeletePageRestrictionUseCase deletePageRestrictionUseCase,
            ExplainPageReadUseCase explainPageReadUseCase,
            BearerCredential bearer) {
        this.viewPagePermissionUseCase = viewPagePermissionUseCase;
        this.putPageRestrictionUseCase = putPageRestrictionUseCase;
        this.deletePageRestrictionUseCase = deletePageRestrictionUseCase;
        this.explainPageReadUseCase = explainPageReadUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/permissions")
    @Operation(operationId = "viewPagePermission", summary = "Read the Page restriction snapshot")
    ResponseEntity<PermissionTypes.PagePermissionView> view(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @PathVariable UUID pageId) {
        var view = viewPagePermissionUseCase.viewPagePermission(bearer.require(), tenantId, spaceId, pageId);
        return response(view);
    }

    @PutMapping("/permissions/restriction")
    @Operation(operationId = "putPageRestriction", summary = "Replace the complete Page restriction")
    ResponseEntity<PermissionTypes.PagePermissionView> putRestriction(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @io.swagger.v3.oas.annotations.Parameter(
                            name = "If-Match",
                            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
                            required = true)
                    @RequestHeader(value = "If-Match", required = false)
                    String ifMatch,
            @Valid @RequestBody RestrictionRequest body) {
        var view = putPageRestrictionUseCase.putPageRestriction(
                bearer.require(), tenantId, spaceId, pageId, body.principals(), PermissionEtag.revision(ifMatch));
        return response(view);
    }

    @DeleteMapping("/permissions/restriction")
    @Operation(operationId = "deletePageRestriction", summary = "Remove the Page restriction")
    ResponseEntity<PermissionTypes.PagePermissionView> deleteRestriction(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @io.swagger.v3.oas.annotations.Parameter(
                            name = "If-Match",
                            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
                            required = true)
                    @RequestHeader(value = "If-Match", required = false)
                    String ifMatch) {
        var view = deletePageRestrictionUseCase.deletePageRestriction(
                bearer.require(), tenantId, spaceId, pageId, PermissionEtag.revision(ifMatch));
        return response(view);
    }

    @GetMapping("/permissions:effective")
    @Operation(operationId = "explainPageRead", summary = "Explain effective Page read access")
    PermissionTypes.EffectivePermissionView effective(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @RequestParam @Pattern(regexp = PermissionPrincipalKeyPattern.VALUE) String principal) {
        return explainPageReadUseCase.explainPageRead(bearer.require(), tenantId, spaceId, pageId, principal);
    }

    private static ResponseEntity<PermissionTypes.PagePermissionView> response(
            PermissionTypes.PagePermissionView view) {
        return ResponseEntity.ok()
                .header("ETag", PermissionEtag.of(view.restriction().revision()))
                .body(view);
    }

    record RestrictionRequest(@NotNull List<@Pattern(regexp = PermissionPrincipalKeyPattern.VALUE) String> principals) {
        RestrictionRequest {
            principals = principals == null ? null : List.copyOf(principals);
        }
    }
}
