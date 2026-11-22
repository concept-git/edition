package io.edition.control.usecases.iam.accountsession;

import static io.edition.control.usecases.iam.accountsession.AccountSessionTypes.*;

import io.edition.control.modules.session.api.SessionApi;
import java.util.UUID;
import org.springframework.scheduling.annotation.Async;

@org.springframework.stereotype.Service
public class TouchUseCase {

    private final SessionApi sessions;

    TouchUseCase(AccountSessionDependencies dependencies) {
        this.sessions = dependencies.sessions;
    }

    @Async
    public void touch(UUID session) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            sessions.touch(new SessionApi.SessionId(session));
        }
    }
}
