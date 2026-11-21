package io.edition.control.compositions.iam.accountsecurity;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** 有效 Bearer 下旧密码不匹配（400 invalid_old_password）；这是业务输入拒绝，不是认证失效。 */
public final class InvalidOldPasswordException extends FlowException {

    public InvalidOldPasswordException() {
        super(ProblemCode.INVALID_OLD_PASSWORD);
    }
}
