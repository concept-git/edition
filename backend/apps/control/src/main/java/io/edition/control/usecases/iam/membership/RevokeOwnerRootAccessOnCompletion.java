package io.edition.control.usecases.iam.membership;

import static io.edition.control.usecases.iam.membership.MembershipTypes.*;

import io.edition.control.modules.membership.api.MembershipApi.Group;
import io.edition.control.modules.membership.api.MembershipApi.MemberId;
import io.edition.control.usecases.access.OwnerRootAccess;

@org.springframework.stereotype.Service
public class RevokeOwnerRootAccessOnCompletion {

    private final OwnerRootAccess ownerRootAccess;

    RevokeOwnerRootAccessOnCompletion(MembershipDependencies dependencies) {
        this.ownerRootAccess = dependencies.ownerRootAccess;
    }

    public void revokeOwnerRootAccess(Group group, MemberId member) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
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
