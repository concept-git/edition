package io.edition.control.adapters.inbound.http.membership;

import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.adapters.inbound.http.security.IdempotencyKeyFilter;
import io.edition.control.adapters.inbound.http.security.IdempotentReplay;
import io.edition.control.usecases.iam.membership.InviteUseCase;
import io.edition.control.usecases.iam.membership.ListInvitesUseCase;
import io.edition.control.usecases.iam.membership.ListMembersUseCase;
import io.edition.control.usecases.iam.membership.MembershipTypes;
import io.edition.control.usecases.iam.membership.RemoveMemberUseCase;
import io.edition.control.usecases.iam.membership.RevokeInviteUseCase;
import io.edition.control.usecases.iam.membership.SetMemberRoleUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * 租户作用域的成员与邀请管理。判定链最外层是租户根，操作 admin；
 * 租户被冻结时统一 403 tenant_suspended（guard 单点执行）。
 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}")
@SecurityRequirement(name = "bearerAuth")
@ApiResponse(
        responseCode = "401",
        description = "Missing, expired or revoked session (authentication_required)",
        content =
                @Content(
                        mediaType = TenantMemberController.PROBLEM,
                        schema = @Schema(ref = "#/components/schemas/ApiProblem")))
@ApiResponse(
        responseCode = "403",
        description = "Not a tenant admin (permission_denied) or tenant frozen (tenant_suspended)",
        content =
                @Content(
                        mediaType = TenantMemberController.PROBLEM,
                        schema = @Schema(ref = "#/components/schemas/ApiProblem")))
class TenantMemberController {

    static final String PROBLEM = "application/problem+json";

    private final InviteUseCase inviteUseCase;
    private final ListMembersUseCase listMembersUseCase;
    private final ListInvitesUseCase listInvitesUseCase;
    private final SetMemberRoleUseCase setMemberRoleUseCase;
    private final RemoveMemberUseCase removeMemberUseCase;
    private final RevokeInviteUseCase revokeInviteUseCase;
    private final BearerCredential bearer;

    TenantMemberController(
            InviteUseCase inviteUseCase,
            ListMembersUseCase listMembersUseCase,
            ListInvitesUseCase listInvitesUseCase,
            SetMemberRoleUseCase setMemberRoleUseCase,
            RemoveMemberUseCase removeMemberUseCase,
            RevokeInviteUseCase revokeInviteUseCase,
            BearerCredential bearer) {
        this.inviteUseCase = inviteUseCase;
        this.listMembersUseCase = listMembersUseCase;
        this.listInvitesUseCase = listInvitesUseCase;
        this.setMemberRoleUseCase = setMemberRoleUseCase;
        this.removeMemberUseCase = removeMemberUseCase;
        this.revokeInviteUseCase = revokeInviteUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/members")
    @Operation(
            operationId = "listTenantMembers",
            summary = "List the tenant's members",
            description = "Cursor paginated by join time. The cursor is opaque; pass nextCursor verbatim.")
    @ApiResponse(responseCode = "200", description = "One page of members")
    MembershipTypes.Members members(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listMembersUseCase.listMembers(bearer.require(), tenantId, cursor, limit);
    }

    @PatchMapping("/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "setTenantMemberRole",
            summary = "Change a member's role",
            description = "Promoting to owner grants tenant-root admin immediately; demoting revokes it.")
    @ApiResponse(
            responseCode = "404",
            description = "Not a member of this tenant (member_not_found)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    @ApiResponse(
            responseCode = "409",
            description = "Would leave the tenant without an owner (last_owner)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    void setRole(
            @PathVariable UUID tenantId, @PathVariable UUID userId, @Valid @RequestBody MemberRoleRequest request) {
        setMemberRoleUseCase.setMemberRole(bearer.require(), tenantId, userId, request.role());
    }

    @DeleteMapping("/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "removeTenantMember",
            summary = "Remove a member",
            description = "Idempotent for non-members. Removing an owner also revokes its tenant-root admin.")
    @ApiResponse(
            responseCode = "409",
            description = "Would leave the tenant without an owner (last_owner)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    void remove(@PathVariable UUID tenantId, @PathVariable UUID userId) {
        removeMemberUseCase.removeMember(bearer.require(), tenantId, userId);
    }

    @GetMapping("/invitations")
    @Operation(
            operationId = "listTenantInvitations",
            summary = "List pending invitations",
            description = "Summaries only: the one-time token is never readable again.")
    @ApiResponse(responseCode = "200", description = "One page of pending invitations")
    MembershipTypes.Invites invites(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listInvitesUseCase.listInvites(bearer.require(), tenantId, cursor, limit);
    }

    @PostMapping("/invitations")
    @Operation(
            operationId = "inviteTenantMember",
            summary = "Invite someone to the tenant",
            description = "Valid for seven days. Re-inviting the same address invalidates the earlier link. "
                    + "Idempotency-Key is required; retries with the same canonical request replay the first "
                    + "201 response including its plaintext token.")
    @Parameter(
            name = "Idempotency-Key",
            in = ParameterIn.HEADER,
            required = true,
            description = "Stable key for this user action (1-255 characters)")
    @ApiResponse(
            responseCode = "201",
            description = "Invitation issued",
            content =
                    @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = MembershipTypes.IssuedInvite.class)))
    @ApiResponse(
            responseCode = "400",
            description = "Missing or invalid Idempotency-Key (invalid_idempotency_key)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    @ApiResponse(
            responseCode = "409",
            description = "Already a member (already_member), key reused for another request "
                    + "(idempotency_key_reused), or a request is still processing "
                    + "(idempotency_request_in_progress)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    @ApiResponse(
            responseCode = "422",
            description = "Unknown role (member_role_invalid)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    ResponseEntity<String> invite(
            @PathVariable UUID tenantId,
            @Valid @RequestBody InviteRequest request,
            @Parameter(hidden = true) HttpServletRequest servletRequest) {
        return IdempotentReplay.of(inviteUseCase.invite(
                bearer.require(),
                tenantId,
                request.email(),
                request.role(),
                IdempotencyKeyFilter.require(servletRequest)));
    }

    @DeleteMapping("/invitations/{inviteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "revokeTenantInvitation",
            summary = "Revoke a pending invitation",
            description = "Idempotent. The invite link stops working immediately.")
    void revoke(@PathVariable UUID tenantId, @PathVariable UUID inviteId) {
        revokeInviteUseCase.revokeInvite(bearer.require(), tenantId, inviteId);
    }

    record InviteRequest(
            @NotBlank @Email String email,

            @NotBlank @Schema(allowableValues = {"owner", "member"})
            String role) {}

    record MemberRoleRequest(
            @NotBlank @Schema(allowableValues = {"owner", "member"})
            String role) {}
}
