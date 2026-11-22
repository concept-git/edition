package io.edition.control.usecases.releases.bundleexport;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

public final class ExportProblem extends FlowException {
    private ExportProblem(ProblemCode code) {
        super(code);
    }

    static ExportProblem notFound() {
        return new ExportProblem(ProblemCode.EXPORT_NOT_FOUND);
    }

    static ExportProblem notReady() {
        return new ExportProblem(ProblemCode.EXPORT_NOT_READY);
    }

    static ExportProblem expired() {
        return new ExportProblem(ProblemCode.EXPORT_EXPIRED);
    }
}
