package io.edition.control.usecases.releases.bundleexport;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** Raised after recording confirmed artifact loss, so the original task can be rebuilt. */
final class ExportOutputMissingException extends FlowException {
    ExportOutputMissingException() {
        super(ProblemCode.DEPENDENCY_UNAVAILABLE);
    }
}
