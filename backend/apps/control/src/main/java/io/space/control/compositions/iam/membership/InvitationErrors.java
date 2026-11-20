package io.space.control.compositions.iam.membership;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.shared.ValidationViolation;
import java.util.List;

/** 邀请生命周期专属 error case。成员关系词汇（already_member / last_owner 等）仍是顶层公开类型，供 team 复用。 */
final class InviteAlreadyAcceptedException extends FlowException {
    InviteAlreadyAcceptedException() {
        super(ProblemCode.INVITE_ALREADY_ACCEPTED);
    }
}

final class InviteEmailMismatchException extends FlowException {
    InviteEmailMismatchException() {
        super(ProblemCode.INVITE_EMAIL_MISMATCH);
    }
}

final class InviteExpiredException extends FlowException {
    InviteExpiredException() {
        super(ProblemCode.INVITE_EXPIRED);
    }
}

final class MemberRoleInvalidException extends FlowException {
    MemberRoleInvalidException(String value) {
        super(
                ProblemCode.MEMBER_ROLE_INVALID,
                List.of(new ValidationViolation("role", "invalid_member_role")),
                "unknown member role: " + value);
    }
}
