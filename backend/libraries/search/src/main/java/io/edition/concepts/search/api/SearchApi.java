package io.edition.concepts.search.api;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/** Search configuration boundary; runtime indexing and matching belong to delivery. */
public interface SearchApi {
    Boost configureBoost(ScopeId scope, List<String> fields);

    Boost configuredBoost(ScopeId scope);

    record Boost(List<String> fields, long revision) {
        public Boost {
            if (fields == null
                    || fields.size() != 3
                    || !new java.util.HashSet<>(fields).equals(java.util.Set.of("title", "headings", "body"))
                    || revision < 0) throw new IllegalArgumentException("invalid search field order");
            fields = List.copyOf(fields);
        }

        public static Boost defaults() {
            return new Boost(List.of("title", "headings", "body"), 0);
        }
    }

    void terminateScope(ScopeId scope);

    record ScopeId(UUID value) {
        public ScopeId {
            Objects.requireNonNull(value, "scope id");
        }
    }
}
