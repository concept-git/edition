package io.edition.control.usecases.iam.accountsession;

import static io.edition.control.usecases.iam.accountsession.AccountSessionTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.session.api.SessionApi;
import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.modules.user.api.UserApi;

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
