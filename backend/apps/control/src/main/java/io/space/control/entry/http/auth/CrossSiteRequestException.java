package io.space.control.entry.http.auth;

import io.space.control.compositions.flow.ProblemCode;
import io.space.control.entry.http.problem.GatewayProblemException;

/** Cookie 凭据端点只接受 allowlist 内的浏览器来源（ADR-0014；403 cross_site_request_rejected）。 */
public final class CrossSiteRequestException extends GatewayProblemException {

    public CrossSiteRequestException() {
        super(ProblemCode.CROSS_SITE_REQUEST_REJECTED);
    }
}
