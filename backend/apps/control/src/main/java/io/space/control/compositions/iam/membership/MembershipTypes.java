package io.space.control.compositions.iam.membership;

import static io.space.control.compositions.iam.membership.MembershipTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.TenantAccess;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class MembershipTypes {
    private MembershipTypes() {}

    @Schema(name = "TenantMemberSummary")
    public record MemberSummary(UUID id, String name, String role, Instant joinedAt) {

        static MemberSummary of(MembershipApi.MemberView view, Optional<UserApi.Profile> profile) {
            return new MemberSummary(
                    view.member().value(),
                    profile.map(UserApi.Profile::name).orElse("已注销用户"),
                    view.role().name().toLowerCase(Locale.ROOT),
                    view.joinedAt());
        }
    }

    @Schema(name = "TenantMemberPage")
    public record Members(
            List<MemberSummary> items,
            @Schema(nullable = true) String nextCursor) {
        public Members {
            items = List.copyOf(items);
        }
    }

    @Schema(name = "TenantInvitationSummary")
    public record InviteSummary(UUID id, String email, String role, Instant expiresAt, Instant createdAt) {

        static InviteSummary of(MembershipApi.InviteView view) {
            return new InviteSummary(
                    view.id().value(),
                    view.email(),
                    view.role().name().toLowerCase(Locale.ROOT),
                    view.expiresAt(),
                    view.createdAt());
        }
    }

    @Schema(name = "TenantInvitationPage")
    public record Invites(
            List<InviteSummary> items,
            @Schema(nullable = true) String nextCursor) {
        public Invites {
            items = List.copyOf(items);
        }
    }

    @Schema(name = "TenantIssuedInvitation")
    public record IssuedInvite(InviteSummary invite, String token) {}

    public record InviteGroup(UUID id, String name) {

        /** Team 邀请的目标群体摘要；租户邀请为 null。Team 已被删除时邀请视为无效。 */
        static InviteGroup teamOf(Group group, TeamApi teams, TenantAccess access) {
            if (group.type() != MembershipApi.GroupType.TEAM) {
                return null;
            }
            return access.inTenant(group.tenantId(), () -> teams.view(new TeamApi.TeamId(group.id())))
                    .map(view -> new InviteGroup(view.id().value(), view.name()))
                    .orElseThrow(InviteInvalidException::new);
        }
    }

    public record InvitePreview(
            String kind, InviteGroup tenant, InviteGroup team, String email, String role, Instant expiresAt) {}

    @Schema(name = "InvitationAcceptance")
    public record Accepted(String kind, InviteGroup tenant, InviteGroup team, String role) {}
}
