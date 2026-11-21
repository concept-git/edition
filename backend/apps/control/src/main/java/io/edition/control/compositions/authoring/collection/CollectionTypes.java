package io.edition.control.compositions.authoring.collection;

import static io.edition.control.compositions.authoring.collection.CollectionTypes.*;

import com.fasterxml.jackson.annotation.JsonValue;
import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class CollectionTypes {
    private CollectionTypes() {}

    public record CollectionView(List<NodeView> collections, Set<Action> allowedActions) {
        public CollectionView {
            collections = List.copyOf(collections);
            allowedActions = Set.copyOf(allowedActions);
        }
    }

    public record NodeView(
            UUID id,
            UUID parentId,
            int position,
            String name,
            String icon,
            int depth,
            long spaceCount,
            List<NodeView> children) {
        public NodeView {
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

    public static final class CollectionNotEmptyException extends FlowException {
        public CollectionNotEmptyException() {
            super(ProblemCode.COLLECTION_NOT_EMPTY);
        }
    }

    public static final class CollectionNameTakenException extends FlowException {
        public CollectionNameTakenException() {
            super(ProblemCode.COLLECTION_NAME_TAKEN);
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
}
