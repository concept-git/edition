package io.space.control.compositions.iam.registration;

import java.util.UUID;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class RegistrationSignals {
    private RegistrationSignals() {}

    public record AcceptInviteOnRegister(
            UUID user, String email, io.space.control.compositions.flow.RuleCompletion<Void> completion) {
        @Override
        public String toString() {
            return "AcceptInviteOnRegister[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId()
                    + "]";
        }
    }
}
