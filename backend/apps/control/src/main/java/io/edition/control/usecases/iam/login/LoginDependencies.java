package io.edition.control.usecases.iam.login;

import static io.edition.control.usecases.iam.login.LoginTypes.*;

import io.edition.control.modules.password.api.PasswordApi;
import io.edition.control.modules.session.api.SessionApi;
import io.edition.control.modules.user.api.UserApi;
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
