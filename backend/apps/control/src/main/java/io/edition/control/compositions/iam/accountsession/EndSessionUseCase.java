package io.edition.control.compositions.iam.accountsession;

import static io.edition.control.compositions.iam.accountsession.AccountSessionTypes.*;

import io.edition.concepts.session.api.SessionApi;
import java.util.UUID;

@org.springframework.stereotype.Service
public class EndSessionUseCase {

    private final SessionApi sessions;

    EndSessionUseCase(AccountSessionDependencies dependencies) {
        this.sessions = dependencies.sessions;
    }

    public void endSession(UUID principal, UUID session) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            sessions.end(new SessionApi.SessionId(session), new SessionApi.HolderId(principal));
        }
    }
}
