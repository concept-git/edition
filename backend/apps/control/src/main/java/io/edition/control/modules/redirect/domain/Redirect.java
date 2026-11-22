package io.edition.control.modules.redirect.domain;

import io.edition.control.modules.redirect.api.*;
import io.edition.control.modules.redirect.api.RedirectApi;
import io.edition.control.modules.redirect.api.RedirectPath;
import java.time.Instant;
import java.util.UUID;

public final class Redirect {
    private final UUID scopeId;
    private final RedirectPath path;
    private RedirectApi.TargetType targetType;
    private UUID targetId;
    private RedirectApi.Origin origin;
    private Instant createdAt;

    public Redirect(
            UUID scopeId,
            RedirectPath path,
            RedirectApi.TargetType targetType,
            UUID targetId,
            RedirectApi.Origin origin,
            Instant createdAt) {
        this.scopeId = scopeId;
        this.path = path;
        this.targetType = targetType;
        this.targetId = targetId;
        this.origin = origin;
        this.createdAt = createdAt;
    }

    public void overwrite(RedirectApi.TargetType type, UUID target, RedirectApi.Origin origin, Instant at) {
        this.targetType = type;
        this.targetId = target;
        this.origin = origin;
        this.createdAt = at;
    }

    public RedirectApi.Rule view() {
        return new RedirectApi.Rule(scopeId, path.value(), targetType, targetId, origin, createdAt);
    }

    public UUID scopeId() {
        return scopeId;
    }

    public RedirectPath path() {
        return path;
    }

    public RedirectApi.TargetType targetType() {
        return targetType;
    }

    public UUID targetId() {
        return targetId;
    }

    public RedirectApi.Origin origin() {
        return origin;
    }

    public Instant createdAt() {
        return createdAt;
    }
}
