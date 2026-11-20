package io.space.control.compositions.flow;

/** 同一主体与 operation 下，幂等键已经绑定另一份规范请求（409 idempotency_key_reused）。 */
public final class FlowIdempotencyKeyReusedException extends FlowException {

    public FlowIdempotencyKeyReusedException() {
        super(ProblemCode.IDEMPOTENCY_KEY_REUSED);
    }
}
