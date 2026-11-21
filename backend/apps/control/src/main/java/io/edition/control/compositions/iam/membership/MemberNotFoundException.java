package io.edition.control.compositions.iam.membership;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** 目标用户不是该群体成员（404 member_not_found）。 */
public final class MemberNotFoundException extends FlowException {

    public MemberNotFoundException() {
        super(ProblemCode.MEMBER_NOT_FOUND);
    }
}
