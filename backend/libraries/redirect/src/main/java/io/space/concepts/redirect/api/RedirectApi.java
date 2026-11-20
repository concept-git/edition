package io.space.concepts.redirect.api;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/** Redirect 概念唯一出口。调用方负责建立 tenant scope。 */
public interface RedirectApi {
    RegisterResult register(ScopeId scope, String path, TargetType targetType, UUID targetId, Origin origin);

    void retire(ScopeId scope, String path);

    Optional<Rule> lookup(ScopeId scope, String path);

    Optional<Rule> get(ScopeId scope, String path);

    Page list(ScopeId scope, Optional<Origin> origin, String cursor, int limit);

    record ScopeId(UUID value) {
        public ScopeId {
            Objects.requireNonNull(value, "scope id");
        }
    }

    enum TargetType {
        SPACE,
        PAGE;

        public String stored() {
            return name().toLowerCase(Locale.ROOT);
        }

        public static TargetType parse(String value) {
            return valueOf(value.toUpperCase(Locale.ROOT));
        }
    }

    enum Origin {
        AUTO,
        MANUAL;

        public String stored() {
            return name().toLowerCase(Locale.ROOT);
        }

        public static Origin parse(String value) {
            return valueOf(value.toUpperCase(Locale.ROOT));
        }
    }

    record Rule(UUID scopeId, String path, TargetType targetType, UUID targetId, Origin origin, Instant createdAt) {
        public Rule {
            Objects.requireNonNull(scopeId, "scope");
            Objects.requireNonNull(path, "path");
            Objects.requireNonNull(targetType, "target type");
            Objects.requireNonNull(targetId, "target");
            Objects.requireNonNull(origin, "origin");
            Objects.requireNonNull(createdAt, "created at");
        }

        /** Path remainder after the matched prefix (`/*` rules); empty for exact matches. */
        public String remainder(String requestPath) {
            return RedirectPath.remainder(path, requestPath);
        }
    }

    record Page(List<Rule> items, String nextCursor) {
        public Page {
            items = List.copyOf(items);
        }
    }

    sealed interface RegisterResult {
        record Registered(Rule rule) implements RegisterResult {}

        record PathInvalid() implements RegisterResult {}
    }
}
