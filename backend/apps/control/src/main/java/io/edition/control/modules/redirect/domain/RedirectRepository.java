package io.edition.control.modules.redirect.domain;

import io.edition.control.modules.redirect.api.*;
import io.edition.control.modules.redirect.api.RedirectApi;
import io.edition.control.modules.redirect.api.RedirectPath;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RedirectRepository {
    Optional<Redirect> insert(Redirect redirect);

    Redirect save(Redirect redirect);

    void delete(UUID scope, RedirectPath path);

    Optional<Redirect> find(UUID scope, RedirectPath path);

    Optional<Redirect> lock(UUID scope, RedirectPath path);

    Optional<Redirect> lookup(UUID scope, String requestPath);

    List<Redirect> page(UUID scope, RedirectApi.Origin origin, Instant beforeCreatedAt, String beforePath, int limit);
}
