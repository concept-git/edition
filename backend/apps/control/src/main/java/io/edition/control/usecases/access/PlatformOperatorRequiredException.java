package io.edition.control.usecases.access;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** 平台运维面只对运营员开放（403 platform_operator_required）。 */
public final class PlatformOperatorRequiredException extends FlowException {

    public PlatformOperatorRequiredException() {
        super(ProblemCode.PLATFORM_OPERATOR_REQUIRED, "platform operator privileges are required");
    }
}
