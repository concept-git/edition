package io.space.concepts.space.domain;

import io.space.concepts.space.api.*;
import io.space.concepts.space.api.SpaceApi;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

/** Space aggregate：名称、metadata 与归档迁移的不变量集中于此。 */
public final class Space {
    private final UUID id;
    private final UUID tenantId;
    private SpaceName name;
    private SpaceApi.IconKey icon;
    private String description;
    private SpaceApi.Mode mode;
    private SpaceApi.Status status;
    private boolean autoRelease;
    private final Instant createdAt;
    private final UUID createdBy;
    private Instant updatedAt;
    private UUID updatedBy;

    public Space(
            UUID id,
            UUID tenantId,
            SpaceName name,
            SpaceApi.IconKey icon,
            String description,
            SpaceApi.Mode mode,
            SpaceApi.Status status,
            boolean autoRelease,
            Instant createdAt,
            UUID createdBy,
            Instant updatedAt,
            UUID updatedBy) {
        this.id = Objects.requireNonNull(id, "space id");
        this.tenantId = Objects.requireNonNull(tenantId, "tenant id");
        this.name = Objects.requireNonNull(name, "space name");
        this.icon = icon;
        this.description = normalizeDescription(description);
        this.mode = Objects.requireNonNull(mode, "space mode");
        this.status = Objects.requireNonNull(status, "space status");
        this.autoRelease = autoRelease;
        this.createdAt = Objects.requireNonNull(createdAt, "created at");
        this.createdBy = createdBy;
        this.updatedAt = Objects.requireNonNull(updatedAt, "updated at");
        this.updatedBy = updatedBy;
    }

    public boolean rename(SpaceName next, SpaceApi.ActorId actor) {
        requireActive();
        Objects.requireNonNull(actor, "actor");
        if (name.equals(next)) return false;
        name = next;
        updatedBy = actor.value();
        return true;
    }

    public boolean describe(
            SpaceApi.Patch<SpaceApi.IconKey> iconPatch,
            SpaceApi.Patch<String> descriptionPatch,
            SpaceApi.ActorId actor) {
        requireActive();
        Objects.requireNonNull(actor, "actor");
        SpaceApi.IconKey nextIcon = apply(icon, iconPatch, value -> value);
        String nextDescription = apply(description, descriptionPatch, Space::normalizeDescription);
        if (Objects.equals(icon, nextIcon) && Objects.equals(description, nextDescription)) return false;
        icon = nextIcon;
        description = nextDescription;
        updatedBy = actor.value();
        return true;
    }

    public boolean archive(SpaceApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        if (status == SpaceApi.Status.ARCHIVED) return false;
        status = SpaceApi.Status.ARCHIVED;
        updatedBy = actor.value();
        return true;
    }

    public boolean restore(SpaceApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        if (status == SpaceApi.Status.ACTIVE) return false;
        status = SpaceApi.Status.ACTIVE;
        updatedBy = actor.value();
        return true;
    }

    public boolean setAutoRelease(boolean on, SpaceApi.ActorId actor) {
        requireActive();
        Objects.requireNonNull(actor, "actor");
        if (autoRelease == on) return false;
        autoRelease = on;
        updatedBy = actor.value();
        return true;
    }

    public boolean convert(SpaceApi.Mode toMode, SpaceApi.ActorId actor) {
        requireActive();
        Objects.requireNonNull(toMode, "mode");
        Objects.requireNonNull(actor, "actor");
        if (mode == toMode) return false;
        mode = toMode;
        if (toMode == SpaceApi.Mode.AUTHORED) autoRelease = true;
        updatedBy = actor.value();
        return true;
    }

    public void persistedAt(Instant value) {
        updatedAt = Objects.requireNonNull(value, "updated at");
    }

    public SpaceApi.View view() {
        return new SpaceApi.View(
                id,
                tenantId,
                name.value(),
                icon,
                description,
                mode,
                status,
                autoRelease,
                createdAt,
                createdBy,
                updatedAt,
                updatedBy);
    }

    public UUID id() {
        return id;
    }

    public UUID tenantId() {
        return tenantId;
    }

    public String name() {
        return name.value();
    }

    public String icon() {
        return icon == null ? null : icon.value();
    }

    public String description() {
        return description;
    }

    public String mode() {
        return mode.name().toLowerCase(Locale.ROOT);
    }

    public String status() {
        return status.name().toLowerCase(Locale.ROOT);
    }

    public boolean autoRelease() {
        return autoRelease;
    }

    public UUID updatedBy() {
        return updatedBy;
    }

    private void requireActive() {
        if (status == SpaceApi.Status.ARCHIVED) throw new ArchivedMutation();
    }

    private static String normalizeDescription(String value) {
        if (value == null) return null;
        String normalized = value.strip();
        if (normalized.isEmpty()) return null;
        if (normalized.length() > 4000) {
            throw new IllegalArgumentException("space description must contain at most 4000 characters");
        }
        return normalized;
    }

    private static <T> T apply(T current, SpaceApi.Patch<T> patch, java.util.function.Function<T, T> normalize) {
        return switch (patch) {
            case SpaceApi.Patch.Unchanged<T> ignored -> current;
            case SpaceApi.Patch.Clear<T> ignored -> null;
            case SpaceApi.Patch.Set<T> set -> normalize.apply(set.value());
        };
    }

    public static final class ArchivedMutation extends RuntimeException {}
}
