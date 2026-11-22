package io.edition.control.adapters.inbound.http.auth;

import io.edition.control.adapters.inbound.http.problem.GatewayProblemException;
import io.edition.control.usecases.flow.ProblemCode;

/** Cookie 凭据端点只接受 allowlist 内的浏览器来源（ADR-0014；403 cross_site_request_rejected）。 */
public final class CrossSiteRequestException extends GatewayProblemException {

    public CrossSiteRequestException() {
        super(ProblemCode.CROSS_SITE_REQUEST_REJECTED);
    }
}
