package io.space.control.compositions.iam.login;

import static io.space.control.compositions.iam.login.LoginTypes.*;

import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class LoginSignals {
    private LoginSignals() {}

    public record LoginSucceeded(
            UserApi.UserId user,
            SessionApi.Device device,
            String approximateIp,
            io.space.control.compositions.flow.RuleCompletion<Credentials> completion) {
        @Override
        public String toString() {
            return "LoginSucceeded[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
