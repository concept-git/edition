package io.edition.control.compositions.releases.bundleimport;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

final class ImportBlockedException extends FlowException {
    ImportBlockedException() {
        super(ProblemCode.IMPORT_BLOCKED);
    }
}

final class ImportInProgressException extends FlowException {
    ImportInProgressException() {
        super(ProblemCode.IMPORT_IN_PROGRESS);
    }
}

final class ImportJobNotFoundException extends FlowException {
    ImportJobNotFoundException() {
        super(ProblemCode.IMPORT_JOB_NOT_FOUND);
    }
}

final class ReleaseNotFlaggedException extends FlowException {
    ReleaseNotFlaggedException() {
        super(ProblemCode.RELEASE_NOT_FLAGGED);
    }
}

final class ZipTooLargeException extends FlowException {
    ZipTooLargeException() {
        super(ProblemCode.FILE_TOO_LARGE, List.of(new ValidationViolation("zip", "too_large")));
    }
}

final class ImportUploadNotFoundException extends FlowException {
    ImportUploadNotFoundException() {
        super(ProblemCode.RESOURCE_NOT_FOUND);
    }
}

/** 用户给的远程地址不可达（DNS 失败、非 200、超时）：可由用户修正，4xx。{@code reason} 进 violations 便于排障。 */
final class ImportSourceUnreachableException extends FlowException {
    ImportSourceUnreachableException(String reason) {
        super(ProblemCode.IMPORT_SOURCE_UNREACHABLE, List.of(new ValidationViolation("url", reason)));
    }
}

/** 远程地址本身不被允许（非 https、私网、跳数超限、非法 URL）。 */
final class ImportSourceForbiddenException extends FlowException {
    ImportSourceForbiddenException(String reason) {
        super(ProblemCode.IMPORT_SOURCE_FORBIDDEN, List.of(new ValidationViolation("url", reason)));
    }
}

final class ImportObjectStoreUnavailableException extends FlowException {
    ImportObjectStoreUnavailableException(Throwable cause) {
        super(ProblemCode.DEPENDENCY_UNAVAILABLE);
        initCause(cause);
    }
}
