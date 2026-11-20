package io.space.control.compositions.iam.team;

import static io.space.control.compositions.iam.team.TeamTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.OwnerRootAccess;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;

@org.springframework.stereotype.Component
final class TeamDependencies {
    static final String TENANT_ADMIN = "tenant_admin";
    final TeamAccess access;
    final TenantAccess tenants;
    final TeamApi teams;
    final MembershipApi memberships;
    final PermissionApi permissions;
    final UserApi users;
    final OwnerRootAccess ownerRootAccess;
    final IdempotentFlowExecutor idempotency;

    TeamDependencies(
            TeamAccess access,
            TenantAccess tenants,
            TeamApi teams,
            MembershipApi memberships,
            PermissionApi permissions,
            UserApi users,
            OwnerRootAccess ownerRootAccess,
            IdempotentFlowExecutor idempotency) {
        this.access = access;
        this.tenants = tenants;
        this.teams = teams;
        this.memberships = memberships;
        this.permissions = permissions;
        this.users = users;
        this.ownerRootAccess = ownerRootAccess;
        this.idempotency = idempotency;
    }
}
