package io.space.control.compositions.authoring.permission;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.site.api.SiteApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.principal.PrincipalResolver;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** ACL 元权限与可变主体校验；真实归属由调用方经 ResourceChain 完成。 */
@Component
class PermissionAccess {
    static final Set<String> ROLES = Set.of("admin", "maintainer", "author", "reader", "none");
    private static final Logger log = LoggerFactory.getLogger(PermissionAccess.class);

    private final TenantAccess tenants;
    private final MembershipApi memberships;
    private final TeamApi teams;
    private final UserApi users;
    private final ApiTokenApi tokens;

    PermissionAccess(
            TenantAccess tenants, MembershipApi memberships, TeamApi teams, UserApi users, ApiTokenApi tokens) {
        this.tenants = tenants;
        this.memberships = memberships;
        this.teams = teams;
        this.users = users;
        this.tokens = tokens;
    }

    /** ACL 元权限：已由调用方经 ResourceChain 定位的 Space。 */
    Authorized require(String credential, UUID tenant, SpaceApi.View space) {
        PrincipalResolver.Resolution actor = tenants.admitUser(credential, tenant);
        boolean tenantAdmin = tenants.allows(actor, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        boolean spaceAdmin = tenants.allows(actor, tenant, chain(tenant, space.id()), TenantAccess.ADMIN);
        if (!tenantAdmin && !spaceAdmin) {
            throw new PermissionDeniedException();
        }
        boolean rootRecovery = tenantAdmin && !spaceAdmin;
        if (rootRecovery) {
            log.atInfo()
                    .addKeyValue("tenantId", tenant)
                    .addKeyValue("spaceId", space.id())
                    .addKeyValue("actorId", actor.principal().id())
                    .log("tenant root admin used recoverable permission management access");
        }
        return new Authorized(actor, space, rootRecovery);
    }

    /** ACL 元权限：已由调用方经 ResourceChain 定位的 Site。 */
    AuthorizedSite requireSite(String credential, UUID tenant, SiteApi.View site) {
        PrincipalResolver.Resolution actor = tenants.admitUser(credential, tenant);
        boolean tenantAdmin = tenants.allows(actor, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        boolean siteAdmin = tenants.allows(actor, tenant, siteChain(tenant, site.id()), TenantAccess.ADMIN);
        if (!tenantAdmin && !siteAdmin) {
            throw new PermissionDeniedException();
        }
        boolean rootRecovery = tenantAdmin && !siteAdmin;
        if (rootRecovery) {
            log.atInfo()
                    .addKeyValue("tenantId", tenant)
                    .addKeyValue("siteId", site.id())
                    .addKeyValue("actorId", actor.principal().id())
                    .log("tenant root admin used recoverable site permission management access");
        }
        return new AuthorizedSite(actor, site, rootRecovery);
    }

    PermissionApi.Principal mutablePrincipal(UUID tenant, String principalKey, boolean lockIdentity) {
        PermissionApi.Principal principal = PermissionPrincipalKey.parse(principalKey);
        return switch (principal.type()) {
            case USER -> activeMember(tenant, principal, lockIdentity);
            case TEAM -> existingTeam(tenant, principal, lockIdentity);
            case TOKEN, ANONYMOUS -> throw new PermissionPrincipalTypeUnsupportedException();
        };
    }

    PermissionApi.Principal revocablePrincipal(String principalKey) {
        PermissionApi.Principal principal = PermissionPrincipalKey.parse(principalKey);
        return switch (principal.type()) {
            case USER, TEAM -> principal;
            case TOKEN, ANONYMOUS -> throw new PermissionPrincipalTypeUnsupportedException();
        };
    }

    PermissionApi.Principal siteMutablePrincipal(UUID tenant, String principalKey, boolean lockIdentity) {
        PermissionApi.Principal principal = PermissionPrincipalKey.parse(principalKey);
        return switch (principal.type()) {
            case USER -> activeMember(tenant, principal, lockIdentity);
            case TEAM -> existingTeam(tenant, principal, lockIdentity);
            case ANONYMOUS -> principal;
            case TOKEN -> throw new PermissionPrincipalTypeUnsupportedException();
        };
    }

    PermissionApi.Principal siteRevocablePrincipal(String principalKey) {
        PermissionApi.Principal principal = PermissionPrincipalKey.parse(principalKey);
        return switch (principal.type()) {
            case USER, TEAM, ANONYMOUS -> principal;
            case TOKEN -> throw new PermissionPrincipalTypeUnsupportedException();
        };
    }

    PermissionApi.Role siteRole(PermissionApi.Principal principal, String value) {
        PermissionApi.Role parsed = role(value);
        if (principal.type() == PermissionApi.PrincipalType.ANONYMOUS
                && !parsed.value().equals("reader")
                && !parsed.value().equals("none")) {
            throw new PermissionRoleInvalidException();
        }
        return parsed;
    }

    PermissionApi.Role role(String value) {
        if (value == null) {
            throw new PermissionRoleInvalidException();
        }
        String normalized = value.strip().toLowerCase(Locale.ROOT);
        if (!ROLES.contains(normalized)) {
            throw new PermissionRoleInvalidException();
        }
        return new PermissionApi.Role(normalized);
    }

    PermissionApi.Subject subject(UUID tenant, String principalKey) {
        PermissionApi.Principal principal = PermissionPrincipalKey.parse(principalKey);
        return switch (principal.type()) {
            case USER -> userSubject(tenant, activeMember(tenant, principal, false));
            case TEAM -> PermissionApi.Subject.of(existingTeam(tenant, principal, false));
            case TOKEN -> PermissionApi.Subject.of(existingToken(tenant, principal));
            case ANONYMOUS -> PermissionApi.Subject.of(principal);
        };
    }

    private PermissionApi.Principal activeMember(
            UUID tenant, PermissionApi.Principal principal, boolean lockMembership) {
        var group = MembershipApi.Group.tenant(tenant);
        var member = new MembershipApi.MemberId(principal.id());
        boolean present = tenants.inTenant(
                tenant,
                () -> lockMembership
                        ? memberships.lockMembership(group, member).isPresent()
                        : memberships.isMember(group, member));
        if (!present) {
            throw new PermissionPrincipalNotFoundException();
        }
        var profile = users.accountProfile(new UserApi.UserId(principal.id()))
                .orElseThrow(PermissionPrincipalNotFoundException::new);
        if (profile.status() != UserApi.Status.ACTIVE) {
            throw new PermissionPrincipalInactiveException();
        }
        return principal;
    }

    private PermissionApi.Principal existingTeam(UUID tenant, PermissionApi.Principal principal, boolean lockTeam) {
        TeamApi.View team = tenants.inTenant(
                        tenant,
                        () -> lockTeam
                                ? teams.lock(new TeamApi.TeamId(principal.id()))
                                : teams.view(new TeamApi.TeamId(principal.id())))
                .filter(candidate -> candidate.scope().equals(tenant))
                .orElseThrow(PermissionPrincipalNotFoundException::new);
        return new PermissionApi.Principal(
                PermissionApi.PrincipalType.TEAM, team.id().value());
    }

    private PermissionApi.Subject userSubject(UUID tenant, PermissionApi.Principal principal) {
        Set<PermissionApi.Principal> affiliations =
                tenants
                        .inTenant(tenant, () -> memberships.groupsOf(new MembershipApi.MemberId(principal.id())))
                        .stream()
                        .map(MembershipApi.Membership::group)
                        .filter(group -> group.type() == MembershipApi.GroupType.TEAM)
                        .filter(group -> group.tenantId().equals(tenant))
                        .map(group -> new PermissionApi.Principal(PermissionApi.PrincipalType.TEAM, group.id()))
                        .collect(Collectors.toUnmodifiableSet());
        return new PermissionApi.Subject(principal, affiliations);
    }

    private PermissionApi.Principal existingToken(UUID tenant, PermissionApi.Principal principal) {
        return tenants.inTenant(tenant, () -> tokens.metadata(new ApiTokenApi.TokenId(principal.id())))
                .filter(token -> token.tenantId().equals(tenant))
                .map(token -> principal)
                .orElseThrow(PermissionPrincipalNotFoundException::new);
    }

    static List<PermissionApi.Resource> chain(UUID tenant, UUID space) {
        return List.of(TenantAccess.tenant(tenant), TenantAccess.space(space));
    }

    static List<PermissionApi.Resource> siteChain(UUID tenant, UUID site) {
        return List.of(TenantAccess.tenant(tenant), TenantAccess.site(site));
    }

    record Authorized(PrincipalResolver.Resolution actor, SpaceApi.View space, boolean rootRecovery) {}

    record AuthorizedSite(PrincipalResolver.Resolution actor, SiteApi.View site, boolean rootRecovery) {}
}
