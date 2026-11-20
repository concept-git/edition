package io.space.control.compositions.platform.statistics;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.shared.ValidationViolation;
import java.util.List;

final class StatisticsInputInvalid extends FlowException {
    StatisticsInputInvalid(String field) {
        super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, "invalid")));
    }
}
