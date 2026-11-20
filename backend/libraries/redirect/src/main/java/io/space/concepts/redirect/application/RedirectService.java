package io.space.concepts.redirect.application;

import io.space.concepts.redirect.api.*;
import io.space.concepts.redirect.api.RedirectApi;
import io.space.concepts.redirect.api.RedirectEvents;
import io.space.concepts.redirect.api.RedirectPath;
import io.space.concepts.redirect.domain.Redirect;
import io.space.concepts.redirect.domain.RedirectRepository;
import io.space.shared.PageWindow;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.DateTimeException;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class RedirectService implements RedirectApi {
    private final RedirectRepository repository;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    RedirectService(RedirectRepository repository, ApplicationEventPublisher events, Clock clock) {
        this.repository = repository;
        this.events = events;
        this.clock = clock;
    }

    @Override
    public RegisterResult register(ScopeId scope, String path, TargetType targetType, UUID targetId, Origin origin) {
        final RedirectPath parsed;
        try {
            parsed = new RedirectPath(path);
        } catch (RedirectPath.Invalid ignored) {
            return new RegisterResult.PathInvalid();
        }
        Instant now = clock.instant();
        var current = repository.lock(scope.value(), parsed).orElse(null);
        if (current == null) {
            var created = new Redirect(scope.value(), parsed, targetType, targetId, origin, now);
            var inserted = repository.insert(created);
            if (inserted.isPresent()) return registered(inserted.orElseThrow());
            current = repository.lock(scope.value(), parsed).orElseThrow();
        }
        current.overwrite(targetType, targetId, origin, now);
        return registered(repository.save(current));
    }

    private RegisterResult registered(Redirect saved) {
        var view = saved.view();
        events.publishEvent(new RedirectEvents.Registered(view));
        return new RegisterResult.Registered(view);
    }

    @Override
    public void retire(ScopeId scope, String path) {
        final RedirectPath parsed;
        try {
            parsed = new RedirectPath(path);
        } catch (RedirectPath.Invalid ignored) {
            return;
        }
        repository.delete(scope.value(), parsed);
        events.publishEvent(new RedirectEvents.Retired(scope, parsed.value()));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Rule> lookup(ScopeId scope, String path) {
        String request = path == null ? "" : path.strip();
        if (request.length() > 1 && request.endsWith("/")) {
            request = request.substring(0, request.length() - 1);
        }
        return repository.lookup(scope.value(), request).map(Redirect::view);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Rule> get(ScopeId scope, String path) {
        try {
            return repository.find(scope.value(), new RedirectPath(path)).map(Redirect::view);
        } catch (RedirectPath.Invalid ignored) {
            return Optional.empty();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page list(ScopeId scope, Optional<Origin> origin, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Cursor decoded = Cursor.decode(cursor);
        var rows = repository.page(
                scope.value(),
                origin.orElse(null),
                decoded == null ? null : decoded.at(),
                decoded == null ? null : decoded.path(),
                limit + 1);
        var window = PageWindow.of(
                rows, limit, row -> Cursor.encode(row.createdAt(), row.path().value()));
        return new Page(window.items().stream().map(Redirect::view).toList(), window.nextCursor());
    }

    private record Cursor(Instant at, String path) {
        static String encode(Instant at, String path) {
            String raw = at.toString() + "|" + path;
            return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        }

        static Cursor decode(String cursor) {
            if (cursor == null || cursor.isBlank()) return null;
            try {
                String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
                int separator = raw.indexOf('|');
                if (separator < 0) throw new IllegalArgumentException("cursor lacks a separator");
                return new Cursor(Instant.parse(raw.substring(0, separator)), raw.substring(separator + 1));
            } catch (IllegalArgumentException | DateTimeException invalid) {
                throw new IllegalArgumentException("invalid redirect cursor", invalid);
            }
        }
    }
}
