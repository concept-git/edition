package io.space.control.entry.http.auth;

import io.space.control.compositions.flow.ProblemCode;
import io.space.control.entry.http.problem.GatewayProblemException;

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
