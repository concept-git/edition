package io.edition.control.adapters.inbound.http.auth;

import io.edition.control.adapters.inbound.http.problem.GatewayProblemException;
import io.edition.control.usecases.flow.ProblemCode;

/** 认证端点限流（429 rate_limited + Retry-After）。 */
public final class RateLimitedException extends GatewayProblemException {
    private final long retryAfter;

    RateLimitedException(long retryAfter) {
        super(ProblemCode.RATE_LIMITED);
        this.retryAfter = Math.max(1, retryAfter);
    }

    public long retryAfter() {
        return retryAfter;
    }
}
