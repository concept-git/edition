package io.edition.control.adapters.inbound.http.auth;

import io.edition.control.adapters.inbound.http.problem.GatewayProblemException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;
import org.springframework.http.HttpStatus;

/**
 * 忘记密码请求的邮箱格式不合法。
 *
 * <p>状态码固定 400 而非 validation_failed 的默认 422：`POST /auth/password:forgot` 的已发布契约
 * （contracts/openapi.json）只声明 202/400/429，此处不得擅自改成 422。
 */
public final class InvalidPasswordResetEmailException extends GatewayProblemException {

    public InvalidPasswordResetEmailException() {
        super(
                ProblemCode.VALIDATION_FAILED,
                List.of(new ValidationViolation("email", "invalid_email")),
                HttpStatus.BAD_REQUEST);
    }
}
