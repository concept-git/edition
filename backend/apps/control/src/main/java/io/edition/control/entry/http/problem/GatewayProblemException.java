package io.edition.control.entry.http.problem;

import io.edition.control.compositions.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.http.HttpStatus;

/**
 * HTTP 适配层自身可达失败（头缺失、来源不受信、限流等）的统一载体：与 sync 的 FlowException 同构，
 * 只声明 {@link ProblemCode} 与可选违反项，status/title/detail 由 {@link ProblemCatalog} 查表。
 */
public abstract class GatewayProblemException extends RuntimeException {

    private final ProblemCode code;
    private final List<ValidationViolation> violations;
    private final HttpStatus status;

    protected GatewayProblemException(ProblemCode code) {
        this(code, List.of(), null);
    }

    protected GatewayProblemException(ProblemCode code, List<ValidationViolation> violations) {
        this(code, violations, null);
    }

    /**
     * 少数端点的已发布契约把同一 code 定在 catalog 默认之外的状态码上；这时显式声明并注明出处，
     * 而不是为兼容一个端点去改全局默认。仅 gateway 可用——sync 不认识 HTTP 状态码。
     */
    protected GatewayProblemException(ProblemCode code, List<ValidationViolation> violations, HttpStatus status) {
        super(code.value());
        this.code = Objects.requireNonNull(code, "code");
        this.violations = List.copyOf(violations);
        this.status = status;
    }

    public ProblemCode code() {
        return code;
    }

    public List<ValidationViolation> violations() {
        return violations;
    }

    Optional<HttpStatus> status() {
        return Optional.ofNullable(status);
    }
}
