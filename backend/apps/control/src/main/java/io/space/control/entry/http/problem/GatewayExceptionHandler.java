package io.space.control.entry.http.problem;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.control.compositions.iam.PasswordTooWeakException;
import io.space.control.compositions.iam.accountsecurity.PasswordLockedException;
import io.space.control.compositions.iam.membership.TeamLastOwnerException;
import io.space.control.compositions.iam.usererasure.UserErasureTypes.OwnershipTransferRequiredException;
import io.space.control.compositions.releases.bundleimport.ImportRemoteBusyException;
import io.space.shared.ValidationViolation;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 把一切可达失败收束为 RFC 9457 problem+json。
 *
 * <p>业务 error case 由 sync 以 {@link FlowException} 表达、HTTP 适配层自身的拒绝由 {@link GatewayProblemException}
 * 状态码与文案统一查 {@link ProblemCatalog}。需要额外响应头或附加载荷的失败由各功能包专属 handler 补充。
 * 顶层映射：预期业务拒绝→4xx，瞬态依赖故障→503/504，程序不变量→500+告警。
 */
@RestControllerAdvice
class GatewayExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GatewayExceptionHandler.class);
    private final ProblemResponses problems;

    GatewayExceptionHandler(ProblemResponses problems) {
        this.problems = problems;
    }

    // ---- 通用出口：code 查表 ----

    @ExceptionHandler(FlowException.class)
    ResponseEntity<ApiProblem> flowRejected(FlowException exception, HttpServletRequest request) {
        return problem(exception.code(), request, exception.violations());
    }

    @ExceptionHandler(GatewayProblemException.class)
    ResponseEntity<ApiProblem> gatewayRejected(GatewayProblemException exception, HttpServletRequest request) {
        var status = exception
                .status()
                .orElseGet(() -> ProblemCatalog.of(exception.code()).status());
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problems.body(exception.code(), request)
                        .withStatus(status.value())
                        .withViolations(ProblemResponses.violations(exception.violations())));
    }

    // ---- Spring MVC 自身的请求形态失败 ----

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiProblem> validationFailed(MethodArgumentNotValidException exception, HttpServletRequest request) {
        var violations = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new ValidationViolation(error.getField(), violationCode(error)))
                .distinct()
                .toList();
        return problem(ProblemCode.VALIDATION_FAILED, request, violations);
    }

    /** 查询/路径参数上的约束（@Min/@Max/@Pattern）由 Spring MVC 内建方法校验抛出，与 body 校验同形态返回。 */
    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<ApiProblem> parameterValidationFailed(
            HandlerMethodValidationException exception, HttpServletRequest request) {
        var violations = exception.getParameterValidationResults().stream()
                .flatMap(result -> result.getResolvableErrors().stream()
                        .map(error -> new ValidationViolation(parameterName(result), constraintCode(error))))
                .distinct()
                .toList();
        return problem(ProblemCode.VALIDATION_FAILED, request, violations);
    }

    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiProblem> parameterTypeInvalid(
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException exception,
            HttpServletRequest request) {
        return problem(
                ProblemCode.VALIDATION_FAILED,
                request,
                List.of(new ValidationViolation(exception.getName(), "invalid_format")));
    }

    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ApiProblem> methodNotAllowed(
            org.springframework.web.HttpRequestMethodNotSupportedException exception, HttpServletRequest request) {
        var builder = problems.response(ProblemCode.METHOD_NOT_ALLOWED);
        if (exception.getSupportedMethods() != null)
            builder.header("Allow", String.join(", ", exception.getSupportedMethods()));
        return builder.body(problems.body(ProblemCode.METHOD_NOT_ALLOWED, request));
    }

    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ApiProblem> mediaTypeNotSupported(
            org.springframework.web.HttpMediaTypeNotSupportedException exception, HttpServletRequest request) {
        return problem(ProblemCode.MEDIA_TYPE_NOT_SUPPORTED, request, List.of());
    }

    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotAcceptableException.class)
    ResponseEntity<ApiProblem> responseNotAcceptable(
            org.springframework.web.HttpMediaTypeNotAcceptableException exception, HttpServletRequest request) {
        return problem(ProblemCode.RESPONSE_NOT_ACCEPTABLE, request, List.of());
    }

    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    ResponseEntity<ApiProblem> missingParameter(
            org.springframework.web.bind.MissingServletRequestParameterException exception,
            HttpServletRequest request) {
        return problem(
                ProblemCode.VALIDATION_FAILED,
                request,
                List.of(new ValidationViolation(exception.getParameterName(), "required")));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ApiProblem> notFound(NoResourceFoundException exception, HttpServletRequest request) {
        return problem(ProblemCode.RESOURCE_NOT_FOUND, request, List.of());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiProblem> malformedJson(HttpMessageNotReadableException exception, HttpServletRequest request) {
        return problem(ProblemCode.MALFORMED_JSON, request, List.of());
    }

    /** servlet multipart 上限先于概念校验触发：仍收口为概念的 file_too_large，不落成 500。 */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ApiProblem> uploadTooLarge(MaxUploadSizeExceededException exception, HttpServletRequest request) {
        return problem(ProblemCode.FILE_TOO_LARGE, request, List.of());
    }

    // ---- 需要附加头或载荷的特例 ----

    /** 密码强度违反项来自 Password 概念（field=password）；改密/重设端点的 DTO 字段叫 newPassword。 */
    @ExceptionHandler(PasswordTooWeakException.class)
    ResponseEntity<ApiProblem> passwordTooWeak(PasswordTooWeakException exception, HttpServletRequest request) {
        var field = request.getRequestURI().endsWith("/auth/register") ? "password" : "newPassword";
        var violations = exception.violations().stream()
                .map(violation -> new ValidationViolation(field, violation.code()))
                .toList();
        return problem(ProblemCode.PASSWORD_TOO_WEAK, request, violations);
    }

    @ExceptionHandler(PasswordLockedException.class)
    ResponseEntity<ApiProblem> passwordLocked(PasswordLockedException exception, HttpServletRequest request) {
        long retryAfter =
                Math.max(1, Duration.between(Instant.now(), exception.until()).toSeconds());
        return problems.response(exception.code())
                .header("Retry-After", Long.toString(retryAfter))
                .body(problems.body(exception.code(), request));
    }

    /** 远程地址导入的出流量并发额度已满：503 + Retry-After，让调用方稍后重试同一 Idempotency-Key。 */
    @ExceptionHandler(ImportRemoteBusyException.class)
    ResponseEntity<ApiProblem> importRemoteBusy(ImportRemoteBusyException exception, HttpServletRequest request) {
        return problems.response(exception.code())
                .header("Retry-After", Long.toString(ImportRemoteBusyException.RETRY_AFTER_SECONDS))
                .body(problems.body(exception.code(), request));
    }

    @ExceptionHandler(TeamLastOwnerException.class)
    ResponseEntity<ApiProblem> teamLastOwner(TeamLastOwnerException exception, HttpServletRequest request) {
        return problems.response(exception.code())
                .body(problems.body(exception.code(), request)
                        .withRelatedIds(
                                exception.teams().stream().map(UUID::toString).toList()));
    }

    @ExceptionHandler(OwnershipTransferRequiredException.class)
    ResponseEntity<ApiProblem> ownershipTransferRequired(
            OwnershipTransferRequiredException exception, HttpServletRequest request) {
        return problems.response(exception.code())
                .body(problems.body(exception.code(), request)
                        .withRelatedGroups(exception.groups().stream()
                                .map(group -> new ApiProblem.RelatedGroup(
                                        group.type(),
                                        group.id().toString(),
                                        group.tenantId().toString(),
                                        group.name()))
                                .toList()));
    }

    // ---- 依赖故障与程序错误 ----

    @ExceptionHandler(QueryTimeoutException.class)
    ResponseEntity<ApiProblem> dependencyTimedOut(QueryTimeoutException exception, HttpServletRequest request) {
        log.error("Database timeout traceId={}", problems.traceId(request), exception);
        return problem(ProblemCode.DEPENDENCY_TIMEOUT, request, List.of());
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ApiProblem> dependencyUnavailable(DataAccessException exception, HttpServletRequest request) {
        var dependency = ProblemResponseWriter.dependencyProblem(exception);
        if (dependency == null) return unexpected(exception, request);
        log.error("Database unavailable traceId={}", problems.traceId(request), exception);
        return problem(dependency.code(), request, List.of());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiProblem> unexpected(Exception exception, HttpServletRequest request) {
        var dependency = ProblemResponseWriter.dependencyProblem(exception);
        if (dependency != null) {
            log.error("Wrapped database failure traceId={}", problems.traceId(request), exception);
            return problem(dependency.code(), request, List.of());
        }
        log.error(
                "Unhandled gateway error traceId={} requestId={}",
                problems.traceId(request),
                RequestIds.requestId(request),
                exception);
        return problem(ProblemCode.UNEXPECTED_ERROR, request, List.of());
    }

    // ---- 组装 ----

    private ResponseEntity<ApiProblem> problem(
            ProblemCode code, HttpServletRequest request, List<ValidationViolation> violations) {
        return problems.problem(code, request, violations);
    }

    private static String violationCode(FieldError error) {
        return constraintName(error.getCode());
    }

    /** MessageSourceResolvable 的 codes 形如 ["Min.limit", "Min.int", "Min"]，最短的一个是约束名。 */
    private static String constraintCode(MessageSourceResolvable error) {
        String[] codes = error.getCodes();
        if (codes == null || codes.length == 0) {
            return constraintName(null);
        }
        return constraintName(codes[codes.length - 1]);
    }

    private static String parameterName(ParameterValidationResult result) {
        String name = result.getMethodParameter().getParameterName();
        return name == null || name.isBlank()
                ? "argument" + result.getMethodParameter().getParameterIndex()
                : name;
    }

    private static String constraintName(String constraint) {
        return switch (constraint == null ? "" : constraint) {
            case "NotBlank", "NotEmpty", "NotNull" -> "required";
            case "Email" -> "invalid_email";
            case "Size" -> "size_out_of_range";
            case "Min", "DecimalMin" -> "too_small";
            case "Max", "DecimalMax" -> "too_large";
            case "Pattern" -> "invalid_format";
            default -> "invalid";
        };
    }
}
