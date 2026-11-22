package io.edition.control.usecases.iam.membership;

import static io.edition.control.usecases.iam.membership.MembershipTypes.*;

import io.edition.control.modules.membership.api.MembershipApi.Group;
import io.edition.control.modules.membership.api.MembershipApi.MemberId;
import io.edition.control.modules.membership.api.MembershipApi.Role;
import io.edition.control.usecases.access.OwnerRootAccess;

@org.springframework.stereotype.Service
public class GrantOwnerRootAccessOnCompletion {

    private final OwnerRootAccess ownerRootAccess;

    GrantOwnerRootAccessOnCompletion(MembershipDependencies dependencies) {
        this.ownerRootAccess = dependencies.ownerRootAccess;
    }

    public void grantOwnerRootAccess(Group group, MemberId member, Role role) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            ownerRootAccess.grant(group, member, role);
        }
    }

    @org.springframework.context.event.EventListener
    public void grantOwnerRootAccess(MembershipSignals.GrantOwnerRootAccess binding) {
        if (!binding.completion().claim("grantOwnerRootAccess")) return;
        grantOwnerRootAccess(binding.group(), binding.member(), binding.role());
        binding.completion().complete(null);
    }
}
