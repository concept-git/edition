package io.edition.control.compositions.access;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/**
 * guard 的统一拒绝信号（403 permission_denied）；不携带资源或主体细节，避免异常日志泄露授权结构。
 */
public final class PermissionDeniedException extends FlowException {

    public PermissionDeniedException() {
        super(ProblemCode.PERMISSION_DENIED, "permission denied");
    }
}
