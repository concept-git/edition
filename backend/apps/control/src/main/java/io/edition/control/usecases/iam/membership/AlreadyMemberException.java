package io.edition.control.usecases.iam.membership;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** 受邀邮箱已是该群体成员（409 already_member）。 */
public final class AlreadyMemberException extends FlowException {

    public AlreadyMemberException() {
        super(ProblemCode.ALREADY_MEMBER);
    }
}
