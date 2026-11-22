package io.edition.control.usecases.iam.accountsession;

import static io.edition.control.usecases.iam.accountsession.AccountSessionTypes.*;

import io.edition.control.modules.session.api.SessionApi;
import java.util.UUID;

@org.springframework.stereotype.Service
public class EndSessionUseCase {

    private final SessionApi sessions;

    EndSessionUseCase(AccountSessionDependencies dependencies) {
        this.sessions = dependencies.sessions;
    }

    public void endSession(UUID principal, UUID session) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            sessions.end(new SessionApi.SessionId(session), new SessionApi.HolderId(principal));
        }
    }
}
