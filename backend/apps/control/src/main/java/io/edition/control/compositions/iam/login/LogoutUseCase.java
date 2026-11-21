package io.edition.control.compositions.iam.login;

import static io.edition.control.compositions.iam.login.LoginTypes.*;

import io.edition.concepts.session.api.SessionApi;

@org.springframework.stereotype.Service
public class LogoutUseCase {

    private final SessionApi sessions;

    LogoutUseCase(LoginDependencies dependencies) {
        this.sessions = dependencies.sessions;
    }

    public void logout(String refreshToken) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            if (refreshToken != null && !refreshToken.isBlank()) sessions.endByRefresh(refreshToken);
        }
    }
}
