package io.edition.control.usecases.flow;

import io.edition.shared.ValidationViolation;
import java.util.List;
import java.util.Objects;

/**
 * flow 的业务可达失败（error case）的统一载体：只声明稳定 {@link ProblemCode} 与可选的字段违反项，
 * 不携带任何 HTTP 语义。status/title/detail 由 gateway 的 problem catalog 按 code 查表，
 * 因而新增一个 error case 只需：SYNCS.md 声明 → 子类一行 → catalog 一行。
 *
 * <p>需要附加载荷（冲突内容、阻塞群体等）的异常在子类上加字段，gateway 以专属 handler 补充；
 * 其余全部走通用 handler。程序错误（前置/不变量违反）不得继承本类，继续用 IllegalState/IllegalArgument。
 */
public abstract class FlowException extends RuntimeException {

    private final ProblemCode code;
    private final List<ValidationViolation> violations;

    protected FlowException(ProblemCode code) {
        this(code, List.of(), null);
    }

    protected FlowException(ProblemCode code, List<ValidationViolation> violations) {
        this(code, violations, null);
    }

    protected FlowException(ProblemCode code, String message) {
        this(code, List.of(), message);
    }

    protected FlowException(ProblemCode code, List<ValidationViolation> violations, String message) {
        super(message == null ? code.value() : message);
        this.code = Objects.requireNonNull(code, "code");
        this.violations = List.copyOf(violations);
    }

    public ProblemCode code() {
        return code;
    }

    public List<ValidationViolation> violations() {
        return violations;
    }
}
