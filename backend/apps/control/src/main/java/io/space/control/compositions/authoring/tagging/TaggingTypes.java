package io.space.control.compositions.authoring.tagging;

import static io.space.control.compositions.authoring.tagging.TaggingTypes.*;

import com.fasterxml.jackson.annotation.JsonValue;
import io.space.control.compositions.authoring.pageediting.PageEditingTypes;
import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.shared.ValidationViolation;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class TaggingTypes {
    private TaggingTypes() {}

    public record TagCatalog(List<TagCount> items, String nextCursor, Set<Action> allowedActions) {
        public TagCatalog {
            items = List.copyOf(items);
            allowedActions = Set.copyOf(allowedActions);
        }
    }

    public record TagCount(String label, long pageCount) {}

    public record TaggedPagePage(List<TaggedPage> items, String nextCursor) {
        public TaggedPagePage {
            items = List.copyOf(items);
        }
    }

    public record TaggedPage(
            UUID id,
            String title,
            String slug,
            UUID spaceId,
            String status,
            String format,
            String icon,
            List<String> tags,
            boolean driftFlag,
            Instant updatedAt,
            UUID updatedBy,
            Instant publishedAt,
            Set<PageEditingTypes.Action> allowedActions) {
        public TaggedPage {
            tags = List.copyOf(tags);
            allowedActions = Set.copyOf(allowedActions);
        }
    }

    public record RenameView(String from, String to) {}

    public enum Action {
        READ("read"),
        RENAME("rename");
        private final String value;

        Action(String value) {
            this.value = value;
        }

        @JsonValue
        public String value() {
            return value;
        }
    }

    public static final class TagNotFoundException extends FlowException {
        public TagNotFoundException() {
            super(ProblemCode.TAG_NOT_FOUND);
        }
    }

    public static final class TooManyTagsException extends FlowException {
        public TooManyTagsException() {
            super(ProblemCode.TOO_MANY_TAGS);
        }
    }

    public static final class TagInvalidException extends FlowException {
        public TagInvalidException(String field, String code) {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, code)));
        }
    }
}
