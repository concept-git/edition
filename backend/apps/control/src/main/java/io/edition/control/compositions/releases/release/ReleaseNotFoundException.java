package io.edition.control.compositions.releases.release;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

public final class ReleaseNotFoundException extends FlowException {
    public ReleaseNotFoundException() {
        super(ProblemCode.RELEASE_NOT_FOUND);
    }
}
