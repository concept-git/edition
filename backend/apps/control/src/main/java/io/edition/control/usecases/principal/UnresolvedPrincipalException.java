package io.edition.control.usecases.principal;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/**
 * 没有任何凭据解析器识别调用方；这是认证失败（401），不是已认证主体的授权失败（403）。
 */
public final class UnresolvedPrincipalException extends FlowException {

    public UnresolvedPrincipalException() {
        super(ProblemCode.AUTHENTICATION_REQUIRED, "credential did not resolve to a principal");
    }
}
