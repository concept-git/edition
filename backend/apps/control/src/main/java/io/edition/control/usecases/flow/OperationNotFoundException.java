package io.edition.control.usecases.flow;

/** A scoped operational record is absent or expired. */
public final class OperationNotFoundException extends FlowException {
    public OperationNotFoundException() {
        super(io.edition.control.usecases.flow.ProblemCode.RESOURCE_NOT_FOUND);
    }
}
