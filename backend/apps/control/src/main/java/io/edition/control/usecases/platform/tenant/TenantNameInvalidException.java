package io.edition.control.usecases.platform.tenant;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

/** 租户名为空或超过 120 字符（422 tenant_name_invalid + violations[name]）。 */
public final class TenantNameInvalidException extends FlowException {

    public TenantNameInvalidException(String reason) {
        super(ProblemCode.TENANT_NAME_INVALID, List.of(new ValidationViolation("name", "size_out_of_range")), reason);
    }
}
