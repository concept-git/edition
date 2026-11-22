package io.edition.control.adapters.inbound.http.membership;

import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.adapters.inbound.http.security.IdempotencyKeyFilter;
import io.edition.control.adapters.inbound.http.security.IdempotentReplay;
import io.edition.control.usecases.iam.team.CreateTeamUseCase;
import io.edition.control.usecases.iam.team.DeleteTeamUseCase;
import io.edition.control.usecases.iam.team.GetTeamUseCase;
import io.edition.control.usecases.iam.team.InviteTeamMemberUseCase;
import io.edition.control.usecases.iam.team.ListTeamInvitesUseCase;
import io.edition.control.usecases.iam.team.ListTeamMembersUseCase;
import io.edition.control.usecases.iam.team.ListTeamsUseCase;
import io.edition.control.usecases.iam.team.RemoveTeamMemberUseCase;
import io.edition.control.usecases.iam.team.RenameTeamUseCase;
import io.edition.control.usecases.iam.team.RevokeTeamInviteUseCase;
import io.edition.control.usecases.iam.team.SetTeamMemberRoleUseCase;
import io.edition.control.usecases.iam.team.TeamTypes;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.http.HttpStatus;
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

/** Team 生命周期与成员管理；判定链 [tenant, team]，controller 只做 DTO ↔ flow 翻译。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/teams")
class TeamController {
    private final CreateTeamUseCase createTeamUseCase;
    private final ListTeamsUseCase listTeamsUseCase;
    private final GetTeamUseCase getTeamUseCase;
    private final RenameTeamUseCase renameTeamUseCase;
    private final DeleteTeamUseCase deleteTeamUseCase;
    private final InviteTeamMemberUseCase inviteTeamMemberUseCase;
    private final ListTeamMembersUseCase listTeamMembersUseCase;
    private final SetTeamMemberRoleUseCase setTeamMemberRoleUseCase;
    private final RemoveTeamMemberUseCase removeTeamMemberUseCase;
    private final ListTeamInvitesUseCase listTeamInvitesUseCase;
    private final RevokeTeamInviteUseCase revokeTeamInviteUseCase;
    private final BearerCredential bearer;

    TeamController(
            CreateTeamUseCase createTeamUseCase,
            ListTeamsUseCase listTeamsUseCase,
            GetTeamUseCase getTeamUseCase,
            RenameTeamUseCase renameTeamUseCase,
            DeleteTeamUseCase deleteTeamUseCase,
            InviteTeamMemberUseCase inviteTeamMemberUseCase,
            ListTeamMembersUseCase listTeamMembersUseCase,
            SetTeamMemberRoleUseCase setTeamMemberRoleUseCase,
            RemoveTeamMemberUseCase removeTeamMemberUseCase,
            ListTeamInvitesUseCase listTeamInvitesUseCase,
            RevokeTeamInviteUseCase revokeTeamInviteUseCase,
            BearerCredential bearer) {
        this.createTeamUseCase = createTeamUseCase;
        this.listTeamsUseCase = listTeamsUseCase;
        this.getTeamUseCase = getTeamUseCase;
        this.renameTeamUseCase = renameTeamUseCase;
        this.deleteTeamUseCase = deleteTeamUseCase;
        this.inviteTeamMemberUseCase = inviteTeamMemberUseCase;
        this.listTeamMembersUseCase = listTeamMembersUseCase;
        this.setTeamMemberRoleUseCase = setTeamMemberRoleUseCase;
        this.removeTeamMemberUseCase = removeTeamMemberUseCase;
        this.listTeamInvitesUseCase = listTeamInvitesUseCase;
        this.revokeTeamInviteUseCase = revokeTeamInviteUseCase;
        this.bearer = bearer;
    }

    @PostMapping
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            description = "Team created",
            content =
                    @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TeamTypes.TeamView.class)))
    ResponseEntity<String> create(
            @PathVariable UUID tenantId,
            @Valid @RequestBody TeamNameRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(createTeamUseCase.createTeam(
                bearer.require(), tenantId, body.name(), IdempotencyKeyFilter.require(request)));
    }

    @GetMapping
    TeamTypes.TeamPage list(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listTeamsUseCase.listTeams(bearer.require(), tenantId, cursor, limit);
    }

    @GetMapping("/{teamId}")
    TeamTypes.TeamView view(@PathVariable UUID tenantId, @PathVariable UUID teamId) {
        return getTeamUseCase.getTeam(bearer.require(), tenantId, teamId);
    }

    @PatchMapping("/{teamId}")
    TeamTypes.TeamView rename(
            @PathVariable UUID tenantId, @PathVariable UUID teamId, @Valid @RequestBody TeamNameRequest body) {
        return renameTeamUseCase.renameTeam(bearer.require(), tenantId, teamId, body.name());
    }

    @DeleteMapping("/{teamId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable UUID tenantId, @PathVariable UUID teamId) {
        deleteTeamUseCase.deleteTeam(bearer.require(), tenantId, teamId);
    }

    @GetMapping("/{teamId}/members")
    TeamTypes.Members members(
            @PathVariable UUID tenantId,
            @PathVariable UUID teamId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listTeamMembersUseCase.listTeamMembers(bearer.require(), tenantId, teamId, cursor, limit);
    }

    @PatchMapping("/{teamId}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void setRole(
            @PathVariable UUID tenantId,
            @PathVariable UUID teamId,
            @PathVariable UUID userId,
            @Valid @RequestBody RoleRequest body) {
        setTeamMemberRoleUseCase.setTeamMemberRole(bearer.require(), tenantId, teamId, userId, body.role());
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void removeMember(@PathVariable UUID tenantId, @PathVariable UUID teamId, @PathVariable UUID userId) {
        removeTeamMemberUseCase.removeTeamMember(bearer.require(), tenantId, teamId, userId);
    }

    @GetMapping("/{teamId}/invitations")
    TeamTypes.Invites invitations(
            @PathVariable UUID tenantId,
            @PathVariable UUID teamId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listTeamInvitesUseCase.listTeamInvites(bearer.require(), tenantId, teamId, cursor, limit);
    }

    @PostMapping("/{teamId}/invitations")
    @io.swagger.v3.oas.annotations.Operation(
            summary = "Invite an existing tenant member to the team",
            description = "The invited account must already belong to the tenant. Team roles are owner or member.")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            description = "Invitation created; one-time secret included",
            content =
                    @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TeamTypes.IssuedInvite.class)))
    ResponseEntity<String> invite(
            @PathVariable UUID tenantId,
            @PathVariable UUID teamId,
            @Valid @RequestBody InviteRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(inviteTeamMemberUseCase.inviteTeamMember(
                bearer.require(), tenantId, teamId, body.email(), body.role(), IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/{teamId}/invitations/{inviteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void revoke(@PathVariable UUID tenantId, @PathVariable UUID teamId, @PathVariable UUID inviteId) {
        revokeTeamInviteUseCase.revokeTeamInvite(bearer.require(), tenantId, teamId, inviteId);
    }

    record TeamNameRequest(@NotBlank @Size(max = 120) String name) {}

    record RoleRequest(
            @NotBlank @Schema(allowableValues = {"owner", "member"})
            String role) {}

    record InviteRequest(
            @NotBlank @Email String email,

            @NotBlank @Schema(allowableValues = {"owner", "member"})
            String role) {}
}
