package io.edition.control.compositions.iam.login;

import static io.edition.control.compositions.iam.login.LoginTypes.*;

import io.edition.concepts.session.api.SessionApi;
import io.edition.concepts.user.api.UserApi;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class LoginRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    LoginRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public Credentials loginSucceeded(UserApi.UserId user, SessionApi.Device device, String approximateIp) {
        var completion = io.edition.control.compositions.flow.RuleCompletion.<Credentials>create();
        return completion.dispatch(events, new LoginSignals.LoginSucceeded(user, device, approximateIp, completion));
    }
}
