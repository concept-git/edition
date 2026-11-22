package io.edition.control.usecases.iam.login;

import static io.edition.control.usecases.iam.login.LoginTypes.*;

import io.edition.control.modules.session.api.SessionApi;
import io.edition.control.modules.user.api.UserApi;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class LoginSignals {
    private LoginSignals() {}

    public record LoginSucceeded(
            UserApi.UserId user,
            SessionApi.Device device,
            String approximateIp,
            io.edition.control.usecases.flow.RuleCompletion<Credentials> completion) {
        @Override
        public String toString() {
            return "LoginSucceeded[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
