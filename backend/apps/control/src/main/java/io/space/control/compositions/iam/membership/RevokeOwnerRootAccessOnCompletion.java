package io.space.control.compositions.iam.membership;

import static io.space.control.compositions.iam.membership.MembershipTypes.*;

import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.control.compositions.access.OwnerRootAccess;

@org.springframework.stereotype.Service
public class RevokeOwnerRootAccessOnCompletion {

    private final OwnerRootAccess ownerRootAccess;

    RevokeOwnerRootAccessOnCompletion(MembershipDependencies dependencies) {
        this.ownerRootAccess = dependencies.ownerRootAccess;
    }

    public void revokeOwnerRootAccess(Group group, MemberId member) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            ownerRootAccess.revoke(group, member);
        }
    }

    @org.springframework.context.event.EventListener
    public void revokeOwnerRootAccess(MembershipSignals.RevokeOwnerRootAccess binding) {
        if (!binding.completion().claim("revokeOwnerRootAccess")) return;
        revokeOwnerRootAccess(binding.group(), binding.member());
        binding.completion().complete(null);
    }
}
