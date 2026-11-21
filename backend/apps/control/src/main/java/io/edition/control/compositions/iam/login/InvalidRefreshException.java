package io.edition.control.compositions.iam.login;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** 刷新凭据无效或已撤销（401 invalid_refresh）；这是前端唯一应清会话的失败。 */
public final class InvalidRefreshException extends FlowException {
    public InvalidRefreshException() {
        super(ProblemCode.INVALID_REFRESH, "invalid refresh credential");
    }
}
