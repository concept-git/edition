package io.space.control.compositions.releases.release;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.shared.ValidationViolation;
import java.util.List;

final class ReleaseNotArchivedException extends FlowException {
    ReleaseNotArchivedException() {
        super(ProblemCode.RELEASE_NOT_ARCHIVED);
    }
}

final class ReleaseNotDiscardableException extends FlowException {
    ReleaseNotDiscardableException() {
        super(ProblemCode.RELEASE_NOT_DISCARDABLE);
    }
}

final class ReleaseNotPromotableException extends FlowException {
    ReleaseNotPromotableException() {
        super(ProblemCode.RELEASE_NOT_PROMOTABLE);
    }
}

final class ReleasePatchInvalidException extends FlowException {
    ReleasePatchInvalidException() {
        super(ProblemCode.VALIDATION_FAILED, "the Release patch is empty or contains an unsupported value");
    }

    ReleasePatchInvalidException(String field, String code) {
        super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, code)));
    }
}

final class RetentionInvalidException extends FlowException {
    RetentionInvalidException() {
        super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("keep", "size_out_of_range")));
    }
}
