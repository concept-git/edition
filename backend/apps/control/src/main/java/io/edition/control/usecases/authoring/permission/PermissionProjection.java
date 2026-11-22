package io.edition.control.usecases.authoring.permission;

import io.edition.control.modules.apitoken.api.ApiTokenApi;
import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.modules.team.api.TeamApi;
import io.edition.control.modules.user.api.UserApi;
import io.edition.control.usecases.access.TenantAccess;
import java.time.Clock;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** Permission 概念值到管理面稳定 DTO 的投影。 */
@Component
class PermissionProjection {
    private static List<PermissionTypes.PermissionAction> effective(
            io.edition.control.usecases.principal.PrincipalResolver.Resolution actor,
            List<PermissionTypes.PermissionAction> actions) {
        return actions.stream()
                .filter(a -> io.edition.control.usecases.access.ManagementCapabilities.permits(
                        actor,
                        a == PermissionTypes.PermissionAction.EXPLAIN ? "permissions:read" : "permissions:write"))
                .toList();
    }

    private final PermissionApi permissions;
    private final UserApi users;
    private final TeamApi teams;
    private final ApiTokenApi tokens;
    private final MembershipApi memberships;
    private final TenantAccess tenants;
    private final Clock clock;

    PermissionProjection(
            PermissionApi permissions,
            UserApi users,
            TeamApi teams,
            ApiTokenApi tokens,
            MembershipApi memberships,
            TenantAccess tenants,
            Clock clock) {
        this.permissions = permissions;
        this.users = users;
        this.teams = teams;
        this.tokens = tokens;
        this.memberships = memberships;
        this.tenants = tenants;
        this.clock = clock;
    }

    PermissionTypes.GrantView grant(
            UUID tenant,
            UUID space,
            PermissionApi.Grant grant,
            boolean archived,
            io.edition.control.usecases.principal.PrincipalResolver.Resolution actor) {
        return grant(tenant, PermissionApi.ResourceType.SPACE, space, grant, archived, false, actor);
    }

    PermissionTypes.GrantView siteGrant(
            UUID tenant,
            UUID site,
            PermissionApi.Grant grant,
            io.edition.control.usecases.principal.PrincipalResolver.Resolution actor) {
        return grant(tenant, PermissionApi.ResourceType.SITE, site, grant, false, true, actor);
    }

    private PermissionTypes.GrantView grant(
            UUID tenant,
            PermissionApi.ResourceType localType,
            UUID resourceId,
            PermissionApi.Grant grant,
            boolean archived,
            boolean anonymousMutable,
            io.edition.control.usecases.principal.PrincipalResolver.Resolution actor) {
        boolean local =
                grant.resource().type() == localType && grant.resource().id().equals(resourceId);
        boolean mutableType = grant.principal().type() == PermissionApi.PrincipalType.USER
                || grant.principal().type() == PermissionApi.PrincipalType.TEAM
                || (anonymousMutable && grant.principal().type() == PermissionApi.PrincipalType.ANONYMOUS);
        PermissionTypes.PrincipalView principal = principal(tenant, grant.principal());
        List<PermissionTypes.PermissionAction> allowedActions;
        if (!mutableType) {
            allowedActions = List.of();
        } else if (!principal.status().equals("active")) {
            allowedActions = !local || archived ? List.of() : List.of(PermissionTypes.PermissionAction.REVOKE);
        } else if (!local) {
            allowedActions = archived
                    ? List.of(PermissionTypes.PermissionAction.SET_NONE)
                    : List.of(PermissionTypes.PermissionAction.OVERRIDE, PermissionTypes.PermissionAction.SET_NONE);
        } else {
            allowedActions = archived
                    ? List.of(PermissionTypes.PermissionAction.SET_NONE)
                    : List.of(
                            PermissionTypes.PermissionAction.CHANGE_ROLE,
                            PermissionTypes.PermissionAction.REVOKE,
                            PermissionTypes.PermissionAction.SET_NONE);
        }
        return new PermissionTypes.GrantView(
                new PermissionTypes.ResourceView(
                        grant.resource().type().value(), grant.resource().id(), local ? "local" : "inherited"),
                principal,
                PermissionTypes.PermissionRole.of(grant.role().value()),
                permissions.operations(grant.role()).stream()
                        .map(PermissionApi.Operation::value)
                        .map(PermissionTypes.PermissionOperation::of)
                        .sorted()
                        .toList(),
                !effective(actor, allowedActions).isEmpty(),
                effective(actor, allowedActions));
    }

    PermissionTypes.PrincipalView principal(UUID tenant, PermissionApi.Principal principal) {
        return switch (principal.type()) {
            case USER ->
                users.accountProfile(new UserApi.UserId(principal.id()))
                        .map(profile -> new PermissionTypes.PrincipalView(
                                PermissionPrincipalKey.format(principal),
                                "user",
                                principal.id(),
                                profile.name(),
                                profile.status().name().toLowerCase(Locale.ROOT),
                                profile.email(),
                                profile.avatar(),
                                null))
                        .orElseGet(() -> new PermissionTypes.PrincipalView(
                                PermissionPrincipalKey.format(principal),
                                "user",
                                principal.id(),
                                "已注销用户",
                                "erased",
                                null,
                                null,
                                null));
            case TEAM ->
                tenants.inTenant(tenant, () -> teams.view(new TeamApi.TeamId(principal.id())))
                        .map(team -> team(tenant, team))
                        .orElseGet(() -> new PermissionTypes.PrincipalView(
                                PermissionPrincipalKey.format(principal),
                                "team",
                                principal.id(),
                                "已删除 Team",
                                "deleted",
                                null,
                                null,
                                null));
            case TOKEN ->
                tenants.inTenant(tenant, () -> tokens.metadata(new ApiTokenApi.TokenId(principal.id())))
                        .map(token -> new PermissionTypes.PrincipalView(
                                PermissionPrincipalKey.format(principal),
                                "token",
                                principal.id(),
                                token.name(),
                                token.status(clock.instant()),
                                null,
                                null,
                                null))
                        .orElseGet(() -> new PermissionTypes.PrincipalView(
                                PermissionPrincipalKey.format(principal),
                                "token",
                                principal.id(),
                                "已吊销令牌",
                                "revoked",
                                null,
                                null,
                                null));
            case ANONYMOUS ->
                new PermissionTypes.PrincipalView("anonymous", "anonymous", null, "匿名访客", "active", null, null, null);
        };
    }

    PermissionTypes.PrincipalView user(UserApi.SearchItem user) {
        PermissionApi.Principal principal = new PermissionApi.Principal(
                PermissionApi.PrincipalType.USER, user.id().value());
        return new PermissionTypes.PrincipalView(
                PermissionPrincipalKey.format(principal),
                "user",
                principal.id(),
                user.name(),
                user.status().name().toLowerCase(Locale.ROOT),
                user.email(),
                users.accountProfile(user.id())
                        .map(UserApi.AccountProfile::avatar)
                        .orElse(null),
                null);
    }

    PermissionTypes.PrincipalView team(UUID tenant, TeamApi.View team) {
        PermissionApi.Principal principal = new PermissionApi.Principal(
                PermissionApi.PrincipalType.TEAM, team.id().value());
        long memberCount = tenants.inTenant(
                tenant,
                () -> memberships.memberCount(
                        MembershipApi.Group.team(tenant, team.id().value())));
        return new PermissionTypes.PrincipalView(
                PermissionPrincipalKey.format(principal),
                "team",
                principal.id(),
                team.name(),
                "active",
                null,
                null,
                memberCount);
    }

    List<PermissionTypes.PermissionAction> workspaceActions(
            boolean archived, io.edition.control.usecases.principal.PrincipalResolver.Resolution actor) {
        return effective(
                actor,
                archived
                        ? List.of(PermissionTypes.PermissionAction.SET_NONE)
                        : List.of(PermissionTypes.PermissionAction.GRANT));
    }

    PermissionTypes.PagePermissionSummary page(
            PageApi.View page,
            String slug,
            SpaceApi.View space,
            PermissionApi.RestrictionView restriction,
            io.edition.control.usecases.principal.PrincipalResolver.Resolution actor) {
        List<PermissionTypes.PermissionAction> allowedActions;
        if (space.status() == SpaceApi.Status.ACTIVE) {
            allowedActions = restriction.active()
                    ? List.of(
                            PermissionTypes.PermissionAction.EXPLAIN,
                            PermissionTypes.PermissionAction.REPLACE_RESTRICTION,
                            PermissionTypes.PermissionAction.UNRESTRICT)
                    : List.of(PermissionTypes.PermissionAction.EXPLAIN, PermissionTypes.PermissionAction.RESTRICT);
        } else {
            allowedActions = restriction.active()
                    ? List.of(
                            PermissionTypes.PermissionAction.EXPLAIN,
                            PermissionTypes.PermissionAction.NARROW_RESTRICTION)
                    : List.of(PermissionTypes.PermissionAction.EXPLAIN, PermissionTypes.PermissionAction.RESTRICT);
        }
        return new PermissionTypes.PagePermissionSummary(
                page.id(),
                page.title(),
                slug,
                restriction.active(),
                restriction.principals().size(),
                effective(actor, allowedActions));
    }

    PermissionTypes.PagePermissionView pagePermission(
            UUID tenant,
            UUID page,
            SpaceApi.View space,
            PermissionApi.RestrictionView restriction,
            io.edition.control.usecases.principal.PrincipalResolver.Resolution actor) {
        var principals = restriction.principals().stream()
                .map(principal -> principal(tenant, principal))
                .sorted(java.util.Comparator.comparing(PermissionTypes.PrincipalView::key))
                .toList();
        List<PermissionTypes.PermissionAction> allowedActions;
        if (space.status() == SpaceApi.Status.ACTIVE) {
            allowedActions = restriction.active()
                    ? List.of(
                            PermissionTypes.PermissionAction.REPLACE_RESTRICTION,
                            PermissionTypes.PermissionAction.UNRESTRICT,
                            PermissionTypes.PermissionAction.EXPLAIN)
                    : List.of(PermissionTypes.PermissionAction.RESTRICT, PermissionTypes.PermissionAction.EXPLAIN);
        } else {
            allowedActions = restriction.active()
                    ? List.of(
                            PermissionTypes.PermissionAction.NARROW_RESTRICTION,
                            PermissionTypes.PermissionAction.EXPLAIN)
                    : List.of(PermissionTypes.PermissionAction.RESTRICT, PermissionTypes.PermissionAction.EXPLAIN);
        }
        return new PermissionTypes.PagePermissionView(
                page,
                new PermissionTypes.RestrictionView(restriction.active(), principals, restriction.revision()),
                effective(actor, allowedActions));
    }

    PermissionTypes.EffectivePermissionView effective(
            UUID tenant, PermissionApi.Subject subject, PermissionApi.Decision decision) {
        var decisive = decision.trace().stream()
                .filter(PermissionApi.DecisionTrace::decisive)
                .findFirst();
        var matchedLayer = decisive.map(trace -> new PermissionTypes.ResourceView(
                trace.resource().type().value(), trace.resource().id(), "decisive"));
        return new PermissionTypes.EffectivePermissionView(
                principal(tenant, subject.primary()),
                decision.allowed(),
                reason(subject, decision),
                decision.effectiveOperations().stream()
                        .map(PermissionApi.Operation::value)
                        .map(PermissionTypes.PermissionOperation::of)
                        .sorted()
                        .toList(),
                matchedLayer,
                decision.matchedGrants().stream().map(this::effectiveGrant).toList(),
                decision.trace().stream().map(this::trace).toList());
    }

    private PermissionTypes.EffectiveGrantView effectiveGrant(PermissionApi.Grant grant) {
        return new PermissionTypes.EffectiveGrantView(
                new PermissionTypes.ResourceView(
                        grant.resource().type().value(), grant.resource().id(), "trace"),
                PermissionPrincipalKey.format(grant.principal()),
                PermissionTypes.PermissionRole.of(grant.role().value()));
    }

    private PermissionTypes.DecisionTraceView trace(PermissionApi.DecisionTrace trace) {
        return new PermissionTypes.DecisionTraceView(
                new PermissionTypes.ResourceView(
                        trace.resource().type().value(), trace.resource().id(), "trace"),
                trace.subjectGrants().stream().map(this::effectiveGrant).toList(),
                trace.restriction().active(),
                trace.restriction().revision(),
                trace.restrictionMatches().stream()
                        .map(PermissionPrincipalKey::format)
                        .sorted()
                        .toList(),
                trace.restrictionSatisfied(),
                trace.decisive());
    }

    private static PermissionTypes.EffectiveReason reason(
            PermissionApi.Subject subject, PermissionApi.Decision decision) {
        boolean restrictionBlocked = decision.trace().stream()
                .anyMatch(trace -> trace.restriction().active() && !trace.restrictionSatisfied());
        if (restrictionBlocked) {
            return PermissionTypes.EffectiveReason.RESTRICTION_MISS;
        }
        if (decision.matchedGrants().isEmpty()) {
            return PermissionTypes.EffectiveReason.NO_GRANT;
        }
        boolean explicitNone = decision.matchedGrants().stream()
                .anyMatch(grant -> grant.role().value().equals("none"));
        if (explicitNone) {
            return PermissionTypes.EffectiveReason.EXPLICIT_NONE;
        }
        boolean direct = decision.matchedGrants().stream()
                .anyMatch(grant -> grant.principal().equals(subject.primary()));
        return direct ? PermissionTypes.EffectiveReason.DIRECT_GRANT : PermissionTypes.EffectiveReason.TEAM_GRANT;
    }
}
