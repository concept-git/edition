package io.edition.control.adapters.inbound.http.security;

import io.edition.control.adapters.inbound.http.problem.GatewayProblemException;
import io.edition.control.usecases.flow.ProblemCode;

/** 强制幂等端点缺少或给出空白 Idempotency-Key（400 invalid_idempotency_key）。 */
public final class MissingIdempotencyKeyException extends GatewayProblemException {

    public MissingIdempotencyKeyException() {
        super(ProblemCode.INVALID_IDEMPOTENCY_KEY);
    }
}
