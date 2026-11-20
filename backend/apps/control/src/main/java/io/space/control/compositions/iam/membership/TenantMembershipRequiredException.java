package io.space.control.compositions.iam.membership;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

/** 加入或受邀加入 Team 之前必须先是同租户成员（409 tenant_membership_required）。 */
public final class TenantMembershipRequiredException extends FlowException {

    public TenantMembershipRequiredException() {
        super(ProblemCode.TENANT_MEMBERSHIP_REQUIRED);
    }
}
