package io.edition.control.usecases.iam.login;

import static io.edition.control.usecases.iam.login.LoginTypes.*;

import io.edition.control.modules.session.api.SessionApi;

@org.springframework.stereotype.Service
public class LogoutUseCase {

    private final SessionApi sessions;

    LogoutUseCase(LoginDependencies dependencies) {
        this.sessions = dependencies.sessions;
    }

    public void logout(String refreshToken) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            if (refreshToken != null && !refreshToken.isBlank()) sessions.endByRefresh(refreshToken);
        }
    }
}
