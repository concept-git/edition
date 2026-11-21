package io.edition.control.compositions.flow;

import io.edition.concepts.idempotency.api.IdempotencyApi;
import io.edition.concepts.idempotency.api.IdempotencyKeyReusedException;
import io.edition.concepts.idempotency.api.IdempotencyRequestInProgressException;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.shared.Sha256;
import java.util.Arrays;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

/**
 * flow 共用的幂等执行深模块（ADR-0016）：唯一地拥有 scope 翻译、规范请求指纹、JSON 响应重放与异常语义。
 *
 * <p>flow 直接调用本类，不再各自包一层翻译；请求指纹一律由 {@link #canonical} 生成，
 * 保证"同一请求"的定义在全部 mutation 上一致（null 与空串可区分、字段边界不可伪造）。
 */
@Component
public final class IdempotentFlowExecutor {
    private static final String JSON = "application/json";

    private final IdempotencyApi idempotency;
    private final JsonMapper json;

    IdempotentFlowExecutor(IdempotencyApi idempotency, JsonMapper json) {
        this.idempotency = idempotency;
        this.json = json;
    }

    /** 有载荷的幂等 mutation：首次执行 action 并以 status 存储；重放直接返回存储的响应。 */
    public <T> FlowResponse<T> execute(
            PermissionApi.Principal principal,
            String key,
            String operation,
            String canonicalRequest,
            int status,
            Class<T> responseType,
            Supplier<T> action) {
        var stored = run(command(principal, key, operation, canonicalRequest), () -> encode(status, action.get()));
        return new FlowResponse<>(
                decode(stored.body(), responseType), stored.status(), stored.contentType(), stored.body());
    }

    /** 无载荷的幂等 mutation（204）。 */
    public void execute(
            PermissionApi.Principal principal, String key, String operation, String canonicalRequest, Runnable action) {
        run(command(principal, key, operation, canonicalRequest), () -> {
            action.run();
            return new IdempotencyApi.StoredResponse(204, "", JSON);
        });
    }

    /**
     * 规范请求：每个值以 {@code 长度:文本} 编码后拼接，null 记为 {@code -1:}。
     * 长度前缀让字段边界不可伪造；调用方负责在传入前完成业务归一（strip、小写等）。
     */
    public static String canonical(Object... values) {
        return Arrays.stream(values)
                .map(value -> value == null ? "-1:" : value.toString().length() + ":" + value)
                .collect(Collectors.joining());
    }

    public static String fingerprint(String canonicalRequest) {
        return Sha256.hex(canonicalRequest);
    }

    private IdempotencyApi.StoredResponse run(
            IdempotencyApi.Command command, Supplier<IdempotencyApi.StoredResponse> action) {
        try {
            return idempotency.execute(command, action);
        } catch (IdempotencyKeyReusedException conflict) {
            throw new FlowIdempotencyKeyReusedException();
        } catch (IdempotencyRequestInProgressException processing) {
            throw new FlowIdempotencyRequestInProgressException();
        }
    }

    private static IdempotencyApi.Command command(
            PermissionApi.Principal principal, String key, String operation, String canonicalRequest) {
        return new IdempotencyApi.Command(
                principal.type().value(), principal.id(), operation, key, fingerprint(canonicalRequest));
    }

    private <T> IdempotencyApi.StoredResponse encode(int status, T value) {
        try {
            return new IdempotencyApi.StoredResponse(status, json.writeValueAsString(value), JSON);
        } catch (JacksonException failure) {
            throw new IllegalStateException("failed to serialize idempotent flow response", failure);
        }
    }

    private <T> T decode(String body, Class<T> responseType) {
        try {
            return json.readValue(body, responseType);
        } catch (JacksonException failure) {
            throw new IllegalStateException("stored idempotent flow response is invalid", failure);
        }
    }
}
