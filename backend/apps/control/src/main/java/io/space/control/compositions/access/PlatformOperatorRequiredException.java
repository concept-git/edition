package io.space.control.compositions.access;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

/** 平台运维面只对运营员开放（403 platform_operator_required）。 */
public final class PlatformOperatorRequiredException extends FlowException {

    public PlatformOperatorRequiredException() {
        super(ProblemCode.PLATFORM_OPERATOR_REQUIRED, "platform operator privileges are required");
    }
}
