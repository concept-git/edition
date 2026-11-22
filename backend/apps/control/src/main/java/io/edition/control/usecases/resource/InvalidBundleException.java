package io.edition.control.usecases.resource;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** Bundle 无法作为发版快照加载或校验（400 invalid_bundle）。 */
public final class InvalidBundleException extends FlowException {
    public InvalidBundleException() {
        super(ProblemCode.INVALID_BUNDLE);
    }
}
