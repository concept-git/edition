package io.edition.control.usecases.authoring.permission;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

final class PermissionPrincipalNotFoundException extends FlowException {
    PermissionPrincipalNotFoundException() {
        super(ProblemCode.PERMISSION_PRINCIPAL_NOT_FOUND);
    }
}

final class PermissionPrincipalInactiveException extends FlowException {
    PermissionPrincipalInactiveException() {
        super(ProblemCode.PERMISSION_PRINCIPAL_INACTIVE);
    }
}

final class PermissionPrincipalTypeUnsupportedException extends FlowException {
    PermissionPrincipalTypeUnsupportedException() {
        super(ProblemCode.PERMISSION_PRINCIPAL_TYPE_UNSUPPORTED);
    }
}

final class PermissionRoleInvalidException extends FlowException {
    PermissionRoleInvalidException() {
        super(ProblemCode.PERMISSION_ROLE_INVALID);
    }
}

final class PermissionRestrictionTooLargeException extends FlowException {
    PermissionRestrictionTooLargeException() {
        super(ProblemCode.PERMISSION_RESTRICTION_TOO_LARGE);
    }
}

final class PermissionInputInvalidException extends FlowException {
    PermissionInputInvalidException(String field, String code) {
        super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, code)));
    }
}
