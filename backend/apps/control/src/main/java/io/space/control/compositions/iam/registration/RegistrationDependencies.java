package io.space.control.compositions.iam.registration;

import io.space.concepts.mailoutbox.api.MailOutboxApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.OwnerRootAccess;

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
