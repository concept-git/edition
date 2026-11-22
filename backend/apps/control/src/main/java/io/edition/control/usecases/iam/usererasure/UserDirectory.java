package io.edition.control.usecases.iam.usererasure;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.team.api.TeamApi;
import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.modules.tenantregistry.api.TenantScopeApi;
import io.edition.control.modules.user.api.UserApi;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import io.edition.control.usecases.flow.InvalidCursorException;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;

/** 全局用户与群体的只读投影；不存在的主体与已删除群体保持各自语义。 */
@Component
final class UserDirectory {
    private final UserApi users;
    private final MembershipApi memberships;
    private final TeamApi teams;
    private final TenantRegistryApi tenants;
    private final TenantScopeApi tenantScope;
    private final PlatformOperatorGuard platformOperators;

    UserDirectory(
            UserApi users,
            MembershipApi memberships,
            TeamApi teams,
            TenantRegistryApi tenants,
            TenantScopeApi tenantScope,
            PlatformOperatorGuard platformOperators) {
        this.users = users;
        this.memberships = memberships;
        this.teams = teams;
        this.tenants = tenants;
        this.tenantScope = tenantScope;
        this.platformOperators = platformOperators;
    }

    UserErasureTypes.UserPage searchUsers(String credential, String query, String cursor, int limit) {
        platformOperators.require(credential);
        String normalized = query == null ? "" : query.strip();
        if (normalized.codePointCount(0, normalized.length()) < 3) {
            throw new UserErasureTypes.UserSearchQueryInvalidException();
        }
        final UserApi.SearchPage page;
        try {
            page = users.search(normalized, cursor, limit);
        } catch (IllegalArgumentException invalid) {
            if (cursor != null && !cursor.isBlank()) throw new InvalidCursorException();
            throw new UserErasureTypes.UserSearchQueryInvalidException();
        }
        return new UserErasureTypes.UserPage(
                page.users().stream()
                        .map(value -> new UserErasureTypes.UserSummary(
                                value.id().value(),
                                value.email(),
                                value.name(),
                                value.status().name().toLowerCase(Locale.ROOT),
                                value.platformOperator(),
                                value.updatedAt()))
                        .toList(),
                page.nextCursor());
    }

    UserErasureTypes.UserDetail userDetail(String credential, UserApi.UserId user) {
        platformOperators.require(credential);
        UserApi.AccountProfile profile = profile(user);
        List<MembershipApi.Membership> groups = tenantScope.withoutTenant(
                TenantScopeApi.BootstrapReason.USER_SECURITY_CASCADE,
                () -> memberships.groupsOf(new MembershipApi.MemberId(user.value())));
        return new UserErasureTypes.UserDetail(
                user.value(),
                profile.email(),
                profile.name(),
                profile.avatar(),
                profile.locale(),
                profile.verified(),
                profile.status().name().toLowerCase(Locale.ROOT),
                profile.platformOperator(),
                groups.stream().map(this::membershipSummary).toList());
    }

    private UserErasureTypes.MembershipSummary membershipSummary(MembershipApi.Membership membership) {
        boolean soleOwner = membership.role() == MembershipApi.Role.OWNER
                && tenantScope.inTenant(
                                new TenantRegistryApi.TenantId(
                                        membership.group().tenantId()),
                                () -> memberships.ownerCount(membership.group()))
                        <= 1;
        UserErasureTypes.RelatedGroup group = relatedGroup(membership.group());
        return new UserErasureTypes.MembershipSummary(
                group.type(),
                group.id(),
                group.tenantId(),
                group.name(),
                membership.role().name().toLowerCase(Locale.ROOT),
                soleOwner);
    }

    UserErasureTypes.RelatedGroup relatedGroup(MembershipApi.Group group) {
        String name =
                tenantScope.inTenant(new TenantRegistryApi.TenantId(group.tenantId()), () -> switch (group.type()) {
                    case TENANT ->
                        tenants.view(new TenantRegistryApi.TenantId(group.id()))
                                .map(TenantRegistryApi.View::name)
                                .orElse("已删除租户");
                    case TEAM ->
                        teams.view(new TeamApi.TeamId(group.id()))
                                .map(TeamApi.View::name)
                                .orElse("已删除 Team");
                });
        return new UserErasureTypes.RelatedGroup(
                group.type().name().toLowerCase(Locale.ROOT), group.id(), group.tenantId(), name);
    }

    UserApi.AccountProfile profile(UserApi.UserId user) {
        return users.accountProfile(user).orElseThrow(UserErasureTypes.UserNotFoundException::new);
    }
}
