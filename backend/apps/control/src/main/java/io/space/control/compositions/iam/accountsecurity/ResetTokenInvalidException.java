package io.space.control.compositions.iam.accountsecurity;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

/** 重设链接无效、过期或已使用（400 reset_token_invalid）。 */
public final class ResetTokenInvalidException extends FlowException {

    public ResetTokenInvalidException() {
        super(ProblemCode.RESET_TOKEN_INVALID);
    }
}
