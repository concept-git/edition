package io.space.control.compositions.releases.bundleexport;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

/** Raised after recording confirmed artifact loss, so the original task can be rebuilt. */
final class ExportOutputMissingException extends FlowException {
    ExportOutputMissingException() {
        super(ProblemCode.DEPENDENCY_UNAVAILABLE);
    }
}
