package io.edition.control.usecases.authoring.space;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

/** 本 flow 专属 error case；space_not_found / archived / mode 拒绝在组合根。 */
final class LiveReleaseRequiredException extends FlowException {
    LiveReleaseRequiredException() {
        super(ProblemCode.LIVE_RELEASE_REQUIRED);
    }
}

final class SpaceIconInvalidException extends FlowException {
    SpaceIconInvalidException() {
        super(ProblemCode.SPACE_ICON_INVALID, List.of(new ValidationViolation("icon", "unsupported_value")));
    }
}

final class SpaceNameInvalidException extends FlowException {
    SpaceNameInvalidException() {
        super(ProblemCode.SPACE_NAME_INVALID, List.of(new ValidationViolation("name", "size_out_of_range")));
    }
}

final class SpacePatchInvalidException extends FlowException {
    SpacePatchInvalidException() {
        super(ProblemCode.VALIDATION_FAILED, "the Space patch is empty or contains an unsupported value");
    }

    SpacePatchInvalidException(String field, String code) {
        super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, code)));
    }
}
