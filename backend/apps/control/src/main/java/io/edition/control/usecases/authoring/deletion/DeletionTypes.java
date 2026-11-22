package io.edition.control.usecases.authoring.deletion;

import static io.edition.control.usecases.authoring.deletion.DeletionTypes.*;

import com.fasterxml.jackson.annotation.JsonValue;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class DeletionTypes {
    private DeletionTypes() {}

    public record TrashPage(List<TrashItem> items, String nextCursor, Long total, Set<Action> allowedActions) {
        public TrashPage {
            items = List.copyOf(items);
            allowedActions = Set.copyOf(allowedActions);
        }
    }

    public record TrashItem(
            UUID id,
            String title,
            String slug,
            String status,
            String format,
            Instant trashedAt,
            Set<Action> allowedActions) {
        public TrashItem {
            allowedActions = Set.copyOf(allowedActions);
        }
    }

    public enum Action {
        READ("read"),
        EDIT("edit");
        private final String value;

        Action(String value) {
            this.value = value;
        }

        @JsonValue
        public String value() {
            return value;
        }
    }
}
