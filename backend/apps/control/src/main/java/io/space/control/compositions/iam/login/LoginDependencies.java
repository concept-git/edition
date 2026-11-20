package io.space.control.compositions.iam.login;

import static io.space.control.compositions.iam.login.LoginTypes.*;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@org.springframework.stereotype.Component
final class LoginDependencies {
    final LoginRelay relay;
    final LoginFailures loginFailures;
    static final Logger log = LoggerFactory.getLogger(LoginUseCase.class);
    final UserApi users;
    final PasswordApi passwords;
    final SessionApi sessions;

    LoginDependencies(
            UserApi users, PasswordApi passwords, SessionApi sessions, LoginFailures loginFailures, LoginRelay relay) {
        this.relay = relay;
        this.loginFailures = loginFailures;
        this.users = users;
        this.passwords = passwords;
        this.sessions = sessions;
    }
}
