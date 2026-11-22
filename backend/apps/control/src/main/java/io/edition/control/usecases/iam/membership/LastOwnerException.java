package io.edition.control.usecases.iam.membership;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** 群体永远至少保留一位所有者：降级或移出最后一位 owner 被拒（409 last_owner）。 */
public final class LastOwnerException extends FlowException {

    public LastOwnerException() {
        super(ProblemCode.LAST_OWNER);
    }
}
