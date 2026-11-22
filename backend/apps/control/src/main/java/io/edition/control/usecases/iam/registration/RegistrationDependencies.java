package io.edition.control.usecases.iam.registration;

import io.edition.control.modules.mailoutbox.api.MailOutboxApi;
import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.password.api.PasswordApi;
import io.edition.control.modules.tenantregistry.api.TenantScopeApi;
import io.edition.control.modules.user.api.UserApi;
import io.edition.control.usecases.access.OwnerRootAccess;

@org.springframework.stereotype.Component
final class RegistrationDependencies {
    final RegistrationRelay relay;
    final UserApi users;
    final PasswordApi passwords;
    final MembershipApi memberships;
    final TenantScopeApi tenantScope;
    final OwnerRootAccess ownerRootAccess;
    final MailOutboxApi mailOutbox;

    RegistrationDependencies(
            UserApi users,
            PasswordApi passwords,
            MembershipApi memberships,
            TenantScopeApi tenantScope,
            OwnerRootAccess ownerRootAccess,
            MailOutboxApi mailOutbox,
            RegistrationRelay relay) {
        this.relay = relay;
        this.users = users;
        this.passwords = passwords;
        this.memberships = memberships;
        this.tenantScope = tenantScope;
        this.ownerRootAccess = ownerRootAccess;
        this.mailOutbox = mailOutbox;
    }
}
