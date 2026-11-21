package io.edition.control.compositions.platform.search;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

final class SearchConfigurationInvalid extends FlowException {
    SearchConfigurationInvalid(String field) {
        super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, "invalid")));
    }
}
