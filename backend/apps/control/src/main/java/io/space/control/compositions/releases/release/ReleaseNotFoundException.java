package io.space.control.compositions.releases.release;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

public final class ReleaseNotFoundException extends FlowException {
    public ReleaseNotFoundException() {
        super(ProblemCode.RELEASE_NOT_FOUND);
    }
}
