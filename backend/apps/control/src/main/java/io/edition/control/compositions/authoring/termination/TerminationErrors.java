package io.edition.control.compositions.authoring.termination;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

public final class TerminationErrors {
    private TerminationErrors() {}

    public static final class NotArchived extends FlowException {
        public NotArchived() {
            super(ProblemCode.SPACE_NOT_ARCHIVED);
        }
    }

    public static final class Confirmation extends FlowException {
        public Confirmation() {
            super(ProblemCode.DELETION_CONFIRMATION_INVALID);
        }
    }

    public static final class Busy extends FlowException {
        public Busy() {
            super(ProblemCode.RESOURCE_BUSY);
        }
    }
}
