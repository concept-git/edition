package io.edition.control.usecases.iam.accountsecurity;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** 重设链接无效、过期或已使用（400 reset_token_invalid）。 */
public final class ResetTokenInvalidException extends FlowException {

    public ResetTokenInvalidException() {
        super(ProblemCode.RESET_TOKEN_INVALID);
    }
}
