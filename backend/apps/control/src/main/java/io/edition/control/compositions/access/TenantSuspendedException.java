package io.edition.control.compositions.access;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/**
 * 租户被冻结：该租户作用域的管理操作一律拒绝（403 tenant_suspended）。
 * 会话不结束，同一用户在其他租户的操作不受影响；平台运维面豁免，否则无法 resume。
 */
public final class TenantSuspendedException extends FlowException {

    public TenantSuspendedException() {
        super(ProblemCode.TENANT_SUSPENDED, "tenant is suspended");
    }
}
