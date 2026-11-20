package io.space.control.compositions.iam.login;

import static io.space.control.compositions.iam.login.LoginTypes.*;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import java.util.Locale;

@org.springframework.stereotype.Service
public class LoginUseCase {
    private final LoginRelay relay;
    private final LoginFailures loginFailures;

    private final UserApi users;
    private final PasswordApi passwords;

    LoginUseCase(LoginDependencies dependencies) {
        this.relay = dependencies.relay;
        this.loginFailures = dependencies.loginFailures;
        this.users = dependencies.users;
        this.passwords = dependencies.passwords;
    }

    @org.springframework.transaction.annotation.Transactional(noRollbackFor = InvalidCredentialsException.class)
    public Credentials login(String email, String password, Device device, String approximateIp) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            var normalized = email.strip().toLowerCase(Locale.ROOT);
            var user = users.byEmail(normalized).orElse(null);
            if (user == null) {
                return loginFailures.loginUnknownEmail(password);
            }
            var locked = users.lockAccountProfile(user).orElse(null);
            if (locked == null || !locked.verified() || locked.status() != UserApi.Status.ACTIVE) {
                passwords.fakeAuthenticate(password);
                return loginFailures.loginIneligible("ineligible");
            }
            return switch (passwords.authenticate(new PasswordApi.AccountId(user.value()), password)) {
                case PasswordApi.AuthenticateResult.Rejected rejected -> loginFailures.loginFailed(rejected);
                case PasswordApi.AuthenticateResult.Authenticated ignored -> {
                    var profile = users.accountProfile(user).orElseThrow();
                    if (!profile.verified()) yield loginFailures.loginIneligible("unverified");
                    if (!users.isActive(user)) yield loginFailures.loginIneligible("inactive");
                    yield relay.loginSucceeded(
                            user, new SessionApi.Device(device.name(), device.browser(), device.os()), approximateIp);
                }
            };
        }
    }
}
