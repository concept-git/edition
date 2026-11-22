package io.edition.control.usecases.iam.accountsession;

import static io.edition.control.usecases.iam.accountsession.AccountSessionTypes.*;

import io.edition.control.modules.session.api.SessionApi;
import io.edition.control.usecases.flow.InvalidCursorException;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ListSessionsUseCase {

    private final SessionApi sessions;

    ListSessionsUseCase(AccountSessionDependencies dependencies) {
        this.sessions = dependencies.sessions;
    }

    public Sessions listSessions(UUID principal, String cursor, int limit, UUID current) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            final SessionApi.Page page;
            try {
                page = sessions.listOf(
                        new SessionApi.HolderId(principal), cursor, limit, new SessionApi.SessionId(current));
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            return new Sessions(
                    page.sessions().stream()
                            .map(view -> new SessionView(
                                    view.id().value(),
                                    new Device(
                                            view.device().name(),
                                            view.device().browser(),
                                            view.device().os()),
                                    view.ipApproximate(),
                                    view.createdAt(),
                                    view.lastSeenAt(),
                                    view.expiresAt(),
                                    view.current()))
                            .toList(),
                    page.nextCursor());
        }
    }
}
