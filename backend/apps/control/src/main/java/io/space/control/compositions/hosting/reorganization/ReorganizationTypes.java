package io.space.control.compositions.hosting.reorganization;

import static io.space.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.shared.ValidationViolation;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class ReorganizationTypes {
    private ReorganizationTypes() {}

    public record RedirectPage(List<RedirectView> items, String nextCursor) {
        public RedirectPage {
            items = List.copyOf(items);
        }
    }

    public record RedirectView(
            String path,
            UUID targetId,
            String targetType,
            String origin,
            Instant createdAt,
            Long hitCount,
            String currentPath,
            String targetLabel,
            boolean reachable) {}

    public static final class SlugTakenException extends FlowException {
        SlugTakenException() {
            super(ProblemCode.SLUG_TAKEN);
        }
    }

    public static final class SlugInvalidException extends FlowException {
        SlugInvalidException(String field) {
            super(ProblemCode.SLUG_INVALID, List.of(new ValidationViolation(field, "invalid_format")));
        }
    }

    public static final class MountNotFoundException extends FlowException {
        MountNotFoundException() {
            super(ProblemCode.MOUNT_NOT_FOUND);
        }
    }

    public static final class RedirectNotManualException extends FlowException {
        RedirectNotManualException() {
            super(ProblemCode.REDIRECT_NOT_MANUAL);
        }
    }

    public static final class RedirectTargetNotFoundException extends FlowException {
        RedirectTargetNotFoundException() {
            super(ProblemCode.REDIRECT_TARGET_NOT_FOUND);
        }
    }

    public static final class RedirectPathInvalidException extends FlowException {
        RedirectPathInvalidException() {
            this("path");
        }

        RedirectPathInvalidException(String field) {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, "invalid_format")));
        }
    }

    public static final class SameSpaceException extends FlowException {
        SameSpaceException() {
            super(
                    ProblemCode.VALIDATION_FAILED,
                    List.of(new ValidationViolation("toSpace", "must_differ_from_source")));
        }
    }
}
