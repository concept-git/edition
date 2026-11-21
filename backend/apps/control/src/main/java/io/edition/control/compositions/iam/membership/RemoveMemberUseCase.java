package io.edition.control.compositions.iam.membership;

import static io.edition.control.compositions.iam.membership.MembershipTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.membership.api.MembershipApi.RemoveResult;
import io.edition.concepts.membership.api.MembershipApi.Role;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.team.api.TeamApi;
import io.edition.control.compositions.access.OwnerRootAccess;
import io.edition.control.compositions.access.TenantAccess;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RemoveMemberUseCase {
    private final MembershipRelay relay;

    private final TenantAccess access;

    private final MembershipApi memberships;
    private final PermissionApi permissions;
    private final OwnerRootAccess ownerRootAccess;

    private final TeamApi teams;

    RemoveMemberUseCase(MembershipDependencies dependencies) {
        this.relay = dependencies.relay;
        this.access = dependencies.access;
        this.memberships = dependencies.memberships;
        this.permissions = dependencies.permissions;
        this.ownerRootAccess = dependencies.ownerRootAccess;
        this.teams = dependencies.teams;
    }

    @Transactional
    public void removeMember(String credential, UUID tenant, UUID member) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            access.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
            Group group = Group.tenant(tenant);
            var target = new MemberId(member);
            var result = access.inTenant(tenant, () -> {
                // 与 Permission grant 共用同一条 tenant membership 行锁；必须先于全部 Team 锁获取。
                memberships.lockMembership(group, target);
                var teamMemberships = memberships.groupsOf(target).stream()
                        .filter(membership -> membership.group().type() == MembershipApi.GroupType.TEAM)
                        .filter(membership -> membership.group().tenantId().equals(tenant))
                        .sorted(Comparator.comparing(
                                membership -> membership.group().id()))
                        .toList();
                teamMemberships.forEach(membership -> teams.lock(
                                new TeamApi.TeamId(membership.group().id()))
                        .orElseThrow(() -> new IllegalStateException("team membership points to a missing team")));
                var blocked = teamMemberships.stream()
                        .filter(membership -> membership.role() == Role.OWNER)
                        .filter(membership -> memberships.ownerCount(membership.group()) == 1)
                        .map(membership -> membership.group().id())
                        .toList();
                if (!blocked.isEmpty()) throw new TeamLastOwnerException(blocked);
                teamMemberships.forEach(membership -> {
                    memberships.remove(membership.group(), target);
                    ownerRootAccess.revoke(membership.group(), target);
                });
                var outcome = memberships.remove(group, target);
                if (outcome instanceof RemoveResult.Removed) {
                    relay.revokeOwnerRootAccess(group, target);
                    permissions.clearPrincipal(
                            new PermissionApi.Principal(PermissionApi.PrincipalType.USER, target.value()));
                }
                return outcome;
            });
            if (result instanceof RemoveResult.LastOwner) {
                throw new LastOwnerException();
            }
        }
    }
}
