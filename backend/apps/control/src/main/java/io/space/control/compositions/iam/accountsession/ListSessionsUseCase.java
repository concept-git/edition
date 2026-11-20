package io.space.control.compositions.iam.accountsession;

import static io.space.control.compositions.iam.accountsession.AccountSessionTypes.*;

import io.space.concepts.session.api.SessionApi;
import io.space.control.compositions.flow.InvalidCursorException;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ListSessionsUseCase {

    private final SessionApi sessions;

    ListSessionsUseCase(AccountSessionDependencies dependencies) {
        this.sessions = dependencies.sessions;
    }

    public Sessions listSessions(UUID principal, String cursor, int limit, UUID current) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
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
