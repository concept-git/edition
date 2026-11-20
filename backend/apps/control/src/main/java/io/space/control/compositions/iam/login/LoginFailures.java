package io.space.control.compositions.iam.login;

import static io.space.control.compositions.iam.login.LoginTypes.*;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.session.api.SessionApi;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Shared entry policy or read projection; no independent causal invocation. */
@org.springframework.stereotype.Component
final class LoginFailures {
    private static final Logger log = LoggerFactory.getLogger(LoginUseCase.class);
    private final PasswordApi passwords;

    LoginFailures(PasswordApi passwords) {
        this.passwords = passwords;
    }

    Credentials loginUnknownEmail(String password) {
        passwords.fakeAuthenticate(password);
        log.atWarn()
                .addKeyValue("event", "login.failed")
                .addKeyValue("reason", "unknown_email")
                .log("login rejected");
        throw new InvalidCredentialsException();
    }

    Credentials loginFailed(PasswordApi.AuthenticateResult.Rejected rejected) {
        var reason = rejected.reason() == PasswordApi.AuthenticateResult.Reason.LOCKED ? "locked" : "bad_password";
        log.atWarn()
                .addKeyValue("event", reason.equals("locked") ? "login.locked" : "login.failed")
                .addKeyValue("reason", reason)
                .log("login rejected");
        throw new InvalidCredentialsException();
    }

    Credentials loginIneligible(String reason) {
        log.atWarn()
                .addKeyValue("event", "login.ineligible")
                .addKeyValue("reason", reason)
                .log("login rejected");
        throw new InvalidCredentialsException();
    }

    Credentials refreshExpired(SessionApi.RenewResult.Rejected rejected) {
        log.atWarn()
                .addKeyValue("event", "session.refresh-rejected")
                .addKeyValue("reason", rejected.reason().name().toLowerCase(Locale.ROOT))
                .log("session refresh rejected");
        throw new InvalidRefreshException();
    }
}
