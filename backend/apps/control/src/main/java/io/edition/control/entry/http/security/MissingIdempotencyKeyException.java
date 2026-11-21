package io.edition.control.entry.http.security;

import io.edition.control.compositions.flow.ProblemCode;
import io.edition.control.entry.http.problem.GatewayProblemException;

/** 强制幂等端点缺少或给出空白 Idempotency-Key（400 invalid_idempotency_key）。 */
public final class MissingIdempotencyKeyException extends GatewayProblemException {

    public MissingIdempotencyKeyException() {
        super(ProblemCode.INVALID_IDEMPOTENCY_KEY);
    }
}
