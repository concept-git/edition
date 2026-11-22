package io.edition.control.usecases.iam.membership;

import static io.edition.control.usecases.iam.membership.MembershipTypes.*;

import io.edition.control.modules.membership.api.MembershipApi.Group;
import io.edition.control.modules.membership.api.MembershipApi.MemberId;
import io.edition.control.modules.membership.api.MembershipApi.Role;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class MembershipSignals {
    private MembershipSignals() {}

    public record GrantOwnerRootAccess(
            Group group, MemberId member, Role role, io.edition.control.usecases.flow.RuleCompletion<Void> completion) {
        @Override
        public String toString() {
            return "GrantOwnerRootAccess[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId()
                    + "]";
        }
    }

    public record RevokeOwnerRootAccess(
            Group group, MemberId member, io.edition.control.usecases.flow.RuleCompletion<Void> completion) {
        @Override
        public String toString() {
            return "RevokeOwnerRootAccess[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId()
                    + "]";
        }
    }
}
