package io.edition.control.usecases.iam.login;

import static io.edition.control.usecases.iam.login.LoginTypes.*;

import io.edition.control.modules.session.api.SessionApi;
import io.edition.control.modules.user.api.UserApi;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class LoginRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    LoginRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public Credentials loginSucceeded(UserApi.UserId user, SessionApi.Device device, String approximateIp) {
        var completion = io.edition.control.usecases.flow.RuleCompletion.<Credentials>create();
        return completion.dispatch(events, new LoginSignals.LoginSucceeded(user, device, approximateIp, completion));
    }
}
