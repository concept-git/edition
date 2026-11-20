package io.space.control.compositions.platform.tenant;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

/** 引用了不存在的租户（404 tenant_not_found）。 */
public final class TenantNotFoundException extends FlowException {

    public TenantNotFoundException() {
        super(ProblemCode.TENANT_NOT_FOUND, "tenant does not exist");
    }
}
