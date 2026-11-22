package io.edition.control.usecases.iam.membership;

import static io.edition.control.usecases.iam.membership.MembershipTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.membership.api.MembershipApi.Group;
import io.edition.control.modules.membership.api.MembershipApi.MemberId;
import io.edition.control.modules.user.api.UserApi;
import java.util.UUID;

/** Shared entry policy or read projection; no independent causal invocation. */
@org.springframework.stereotype.Component
final class MembershipChecks {
    private final MembershipApi memberships;
    private final UserApi users;

    MembershipChecks(MembershipApi memberships, UserApi users) {
        this.memberships = memberships;
        this.users = users;
    }

    void inviteAlreadyMember(Group group, String email) {
        boolean alreadyMember = users.byEmail(email)
                .map(user -> memberships.isMember(group, new MemberId(user.value())))
                .orElse(false);
        if (alreadyMember) {
            throw new AlreadyMemberException();
        }
    }

    void acceptInviteEmailMismatch(UUID principal, String invitedEmail) {
        String ownEmail = users.accountProfile(new UserApi.UserId(principal))
                .map(UserApi.AccountProfile::email)
                .orElse("");
        if (!ownEmail.equalsIgnoreCase(invitedEmail)) {
            throw new InviteEmailMismatchException();
        }
    }
}
