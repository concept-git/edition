package io.edition.control.compositions.iam.team;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.team.api.TeamApi;
import io.edition.concepts.user.api.UserApi;
import java.util.Locale;
import java.util.Optional;

/** 概念视图 → Team / 成员响应投影。 */
final class TeamProjection {
    private TeamProjection() {}

    static TeamTypes.TeamView team(TeamApi.View view, String callerRole, MembershipApi memberships) {
        var group = MembershipApi.Group.team(view.scope(), view.id().value());
        return new TeamTypes.TeamView(
                view.id().value(),
                view.scope(),
                view.name(),
                callerRole,
                memberships.memberCount(group),
                memberships.ownerCount(group),
                view.createdAt(),
                view.updatedAt());
    }

    static TeamTypes.MemberView member(MembershipApi.MemberView member, Optional<UserApi.AccountProfile> profile) {
        return new TeamTypes.MemberView(
                member.member().value(),
                profile.map(UserApi.AccountProfile::name).orElse("已注销用户"),
                profile.map(UserApi.AccountProfile::avatar).orElse(null),
                profile.map(UserApi.AccountProfile::email).orElse(null),
                member.role().name().toLowerCase(Locale.ROOT),
                member.joinedAt());
    }

    /** 调用方在某 Team 中的成员角色小写名；非成员按 member 显示（仅租户 admin 会走到这一分支）。 */
    static String roleOf(MembershipApi memberships, MembershipApi.Group group, MembershipApi.MemberId principal) {
        return memberships
                .roleOf(group, principal)
                .map(role -> role.name().toLowerCase(Locale.ROOT))
                .orElse("member");
    }
}
