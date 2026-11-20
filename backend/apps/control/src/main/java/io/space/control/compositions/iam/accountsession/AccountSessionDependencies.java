package io.space.control.compositions.iam.accountsession;

import static io.space.control.compositions.iam.accountsession.AccountSessionTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.user.api.UserApi;

@org.springframework.stereotype.Component
final class AccountSessionDependencies {
    final AccountTenants accountTenants;
    final UserApi users;
    final SessionApi sessions;
    final MembershipApi memberships;
    final TenantRegistryApi tenants;

    AccountSessionDependencies(
            UserApi users,
            SessionApi sessions,
            MembershipApi memberships,
            TenantRegistryApi tenants,
            AccountTenants accountTenants) {
        this.accountTenants = accountTenants;
        this.users = users;
        this.sessions = sessions;
        this.memberships = memberships;
        this.tenants = tenants;
    }
}
