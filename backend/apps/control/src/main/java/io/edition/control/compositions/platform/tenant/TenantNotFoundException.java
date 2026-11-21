package io.edition.control.compositions.platform.tenant;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** 引用了不存在的租户（404 tenant_not_found）。 */
public final class TenantNotFoundException extends FlowException {

    public TenantNotFoundException() {
        super(ProblemCode.TENANT_NOT_FOUND, "tenant does not exist");
    }
}
