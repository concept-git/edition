package io.edition.control.usecases.iam.membership;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** 邀请令牌无法解析、已撤销或已使用（400 invite_invalid）。 */
public final class InviteInvalidException extends FlowException {

    public InviteInvalidException() {
        super(ProblemCode.INVITE_INVALID);
    }
}
