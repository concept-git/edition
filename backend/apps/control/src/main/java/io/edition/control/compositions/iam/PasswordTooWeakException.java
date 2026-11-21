package io.edition.control.compositions.iam;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

/**
 * 密码强度拒绝的响应载体：Password.set/change/reset : (too_weak) → 422 password_too_weak。
 * 注册与账户安全两个 flow 共用，故留在 iam 组根；违反项的字段名由 gateway 按端点 DTO 改写。
 */
public final class PasswordTooWeakException extends FlowException {

    public PasswordTooWeakException(List<ValidationViolation> violations) {
        super(ProblemCode.PASSWORD_TOO_WEAK, violations);
    }
}
