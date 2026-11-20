package io.space.control.compositions.iam.login;

import static io.space.control.compositions.iam.login.LoginTypes.*;

import io.space.concepts.session.api.SessionApi;

@org.springframework.stereotype.Service
public class RefreshUseCase {

    private final LoginFailures loginFailures;

    private final SessionApi sessions;

    RefreshUseCase(LoginDependencies dependencies) {
        this.loginFailures = dependencies.loginFailures;
        this.sessions = dependencies.sessions;
    }

    public Credentials refresh(String refreshToken) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            return switch (sessions.renew(refreshToken)) {
                case SessionApi.RenewResult.Renewed renewed -> Credentials.from(renewed.credentials());
                case SessionApi.RenewResult.Rejected rejected -> loginFailures.refreshExpired(rejected);
            };
        }
    }
}
