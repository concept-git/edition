package io.edition.control.compositions.principal;

import io.edition.concepts.session.api.SessionApi;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** 为 gateway 限流提供稳定 Session 键；不暴露 refresh token 或概念类型。 */
@Component
public class RefreshSessionResolver {
    private final SessionApi sessions;

    RefreshSessionResolver(SessionApi sessions) {
        this.sessions = sessions;
    }

    public Optional<UUID> resolve(String refreshToken) {
        return sessions.sessionOf(refreshToken).map(SessionApi.SessionId::value);
    }
}
