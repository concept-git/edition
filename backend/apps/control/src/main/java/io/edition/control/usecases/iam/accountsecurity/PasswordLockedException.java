package io.edition.control.usecases.iam.accountsecurity;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import java.time.Instant;

/** 连续失败进入锁定期（429 password_locked + Retry-After，由 gateway 依 until 计算）。 */
public final class PasswordLockedException extends FlowException {
    private final Instant until;

    public PasswordLockedException(Instant until) {
        super(ProblemCode.PASSWORD_LOCKED);
        this.until = until;
    }

    public Instant until() {
        return until;
    }
}
