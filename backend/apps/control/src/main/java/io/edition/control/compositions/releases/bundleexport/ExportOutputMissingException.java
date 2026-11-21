package io.edition.control.compositions.releases.bundleexport;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** Raised after recording confirmed artifact loss, so the original task can be rebuilt. */
final class ExportOutputMissingException extends FlowException {
    ExportOutputMissingException() {
        super(ProblemCode.DEPENDENCY_UNAVAILABLE);
    }
}
