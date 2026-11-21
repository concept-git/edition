package io.edition.control.compositions.iam.login;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** 邮箱/密码不匹配或账号不可登录（401 invalid_credentials）；不区分原因以免枚举账号。 */
public final class InvalidCredentialsException extends FlowException {
    public InvalidCredentialsException() {
        super(ProblemCode.INVALID_CREDENTIALS, "invalid credentials");
    }
}
