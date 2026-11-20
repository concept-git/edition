package io.space.control.compositions.iam.membership;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

/** 受邀邮箱已是该群体成员（409 already_member）。 */
public final class AlreadyMemberException extends FlowException {

    public AlreadyMemberException() {
        super(ProblemCode.ALREADY_MEMBER);
    }
}
