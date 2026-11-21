package io.edition.control.compositions.resource;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** Bundle 无法作为发版快照加载或校验（400 invalid_bundle）。 */
public final class InvalidBundleException extends FlowException {
    public InvalidBundleException() {
        super(ProblemCode.INVALID_BUNDLE);
    }
}
