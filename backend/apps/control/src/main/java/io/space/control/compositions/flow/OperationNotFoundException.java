package io.space.control.compositions.flow;

/** A scoped operational record is absent or expired. */
public final class OperationNotFoundException extends FlowException {
    public OperationNotFoundException() {
        super(io.space.control.compositions.flow.ProblemCode.RESOURCE_NOT_FOUND);
    }
}
