package io.space.control.compositions.platform.tenant;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.shared.ValidationViolation;
import java.util.List;

/** 租户名为空或超过 120 字符（422 tenant_name_invalid + violations[name]）。 */
public final class TenantNameInvalidException extends FlowException {

    public TenantNameInvalidException(String reason) {
        super(ProblemCode.TENANT_NAME_INVALID, List.of(new ValidationViolation("name", "size_out_of_range")), reason);
    }
}
