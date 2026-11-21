package io.edition.control.compositions.authoring.tocediting;

import static io.edition.control.compositions.authoring.tocediting.TocEditingTypes.*;

import com.fasterxml.jackson.annotation.JsonValue;
import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class TocEditingTypes {
    private TocEditingTypes() {}

    public record TocView(List<EntryView> entries, Set<Action> allowedActions) {
        public TocView {
            entries = List.copyOf(entries);
            allowedActions = Set.copyOf(allowedActions);
        }
    }

    public record EntryView(
            UUID id,
            UUID parentId,
            int position,
            String label,
            String kind,
            UUID targetId,
            String url,
            int depth,
            List<EntryView> children) {
        public EntryView {
            children = List.copyOf(children);
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

    public static final class TocEntryNotFoundException extends FlowException {
        public TocEntryNotFoundException() {
            super(ProblemCode.TOC_ENTRY_NOT_FOUND);
        }
    }

    public static final class DepthExceededException extends FlowException {
        public DepthExceededException() {
            super(ProblemCode.DEPTH_EXCEEDED);
        }
    }

    public static final class CycleDetectedException extends FlowException {
        public CycleDetectedException() {
            super(ProblemCode.CYCLE_DETECTED);
        }
    }

    public static final class PositionInvalidException extends FlowException {
        public PositionInvalidException() {
            super(ProblemCode.POSITION_INVALID);
        }
    }

    public static final class TocInvalidException extends FlowException {
        public TocInvalidException(String field, String code) {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, code)));
        }
    }
}
