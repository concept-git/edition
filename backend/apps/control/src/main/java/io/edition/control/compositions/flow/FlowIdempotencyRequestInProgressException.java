package io.edition.control.compositions.flow;

/** 同一幂等键的首次请求仍在处理中，调用方应带同一键重试（409 idempotency_request_in_progress）。 */
public final class FlowIdempotencyRequestInProgressException extends FlowException {

    public FlowIdempotencyRequestInProgressException() {
        super(ProblemCode.IDEMPOTENCY_REQUEST_IN_PROGRESS);
    }
}
