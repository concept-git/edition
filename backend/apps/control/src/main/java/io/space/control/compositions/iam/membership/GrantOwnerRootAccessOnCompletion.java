package io.space.control.compositions.iam.membership;

import static io.space.control.compositions.iam.membership.MembershipTypes.*;

import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.membership.api.MembershipApi.Role;
import io.space.control.compositions.access.OwnerRootAccess;

@org.springframework.stereotype.Service
public class GrantOwnerRootAccessOnCompletion {

    private final OwnerRootAccess ownerRootAccess;

    GrantOwnerRootAccessOnCompletion(MembershipDependencies dependencies) {
        this.ownerRootAccess = dependencies.ownerRootAccess;
    }

    public void grantOwnerRootAccess(Group group, MemberId member, Role role) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
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
