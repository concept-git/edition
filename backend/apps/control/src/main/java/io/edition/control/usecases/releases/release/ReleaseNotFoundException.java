package io.edition.control.usecases.releases.release;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

public final class ReleaseNotFoundException extends FlowException {
    public ReleaseNotFoundException() {
        super(ProblemCode.RELEASE_NOT_FOUND);
    }
}
