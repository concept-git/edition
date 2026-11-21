package io.edition.control.compositions.iam.membership;

import static io.edition.control.compositions.iam.membership.MembershipTypes.*;

import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.membership.api.MembershipApi.Role;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class MembershipRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    MembershipRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public void grantOwnerRootAccess(Group group, MemberId member, Role role) {
        var completion = io.edition.control.compositions.flow.RuleCompletion.<Void>create();
        completion.dispatch(events, new MembershipSignals.GrantOwnerRootAccess(group, member, role, completion));
    }

    public void revokeOwnerRootAccess(Group group, MemberId member) {
        var completion = io.edition.control.compositions.flow.RuleCompletion.<Void>create();
        completion.dispatch(events, new MembershipSignals.RevokeOwnerRootAccess(group, member, completion));
    }
}
