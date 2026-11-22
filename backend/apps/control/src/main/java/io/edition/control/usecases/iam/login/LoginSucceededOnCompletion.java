package io.edition.control.usecases.iam.login;

import static io.edition.control.usecases.iam.login.LoginTypes.*;

import io.edition.control.modules.session.api.SessionApi;
import io.edition.control.modules.user.api.UserApi;
import org.slf4j.Logger;

@org.springframework.stereotype.Service
public class LoginSucceededOnCompletion {

    private static final Logger log = LoginDependencies.log;

    private final SessionApi sessions;

    LoginSucceededOnCompletion(LoginDependencies dependencies) {
        this.sessions = dependencies.sessions;
    }

    private Credentials loginSucceeded(UserApi.UserId user, SessionApi.Device device, String approximateIp) {
        var started = (SessionApi.StartResult.Started)
                sessions.start(new SessionApi.HolderId(user.value()), device, approximateIp);
        log.atInfo()
                .addKeyValue("event", "login.succeeded")
                .addKeyValue("principalId", user.value())
                .log("login succeeded");
        return Credentials.from(started.credentials());
    }

    @org.springframework.context.event.EventListener
    public void loginSucceeded(LoginSignals.LoginSucceeded binding) {
        if (!binding.completion().claim("loginSucceeded")) return;
        binding.completion().complete(loginSucceeded(binding.user(), binding.device(), binding.approximateIp()));
    }
}
