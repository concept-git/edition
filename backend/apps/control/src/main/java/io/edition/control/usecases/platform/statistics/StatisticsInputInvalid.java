package io.edition.control.usecases.platform.statistics;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

final class StatisticsInputInvalid extends FlowException {
    StatisticsInputInvalid(String field) {
        super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, "invalid")));
    }
}
