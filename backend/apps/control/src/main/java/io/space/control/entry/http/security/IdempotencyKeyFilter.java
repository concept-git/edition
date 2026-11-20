package io.space.control.entry.http.security;

import io.space.control.compositions.flow.ProblemCode;
import io.space.control.entry.http.problem.ProblemResponseWriter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * POST/PATCH/PUT/DELETE 变更的幂等键入口。
 *
 * <p>统一校验并把 key 放入 request attribute。强制幂等端点必须通过 {@link #require}
 * 读取，避免 controller 重复拼写 header；持久裁决由 sync 调用 platform.idempotency。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public final class IdempotencyKeyFilter extends OncePerRequestFilter {

    static final String HEADER = "Idempotency-Key";
    static final String ATTRIBUTE = IdempotencyKeyFilter.class.getName() + ".key";
    private static final int MAX_LENGTH = 255;

    private final ProblemResponseWriter problems;

    IdempotencyKeyFilter(ProblemResponseWriter problems) {
        this.problems = problems;
    }

    public static String require(HttpServletRequest request) {
        Object key = request.getAttribute(ATTRIBUTE);
        if (key instanceof String value) {
            return value;
        }
        throw new MissingIdempotencyKeyException();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !HttpMethod.POST.matches(request.getMethod())
                && !HttpMethod.PATCH.matches(request.getMethod())
                && !HttpMethod.PUT.matches(request.getMethod())
                && !HttpMethod.DELETE.matches(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        var key = request.getHeader(HEADER);
        if (key != null && (key.isBlank() || key.length() > MAX_LENGTH)) {
            problems.write(
                    request,
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    ProblemCode.INVALID_IDEMPOTENCY_KEY,
                    "Invalid idempotency key",
                    "Idempotency-Key must contain between 1 and 255 characters.");
            return;
        }
        if (key != null) {
            request.setAttribute(ATTRIBUTE, key);
        }
        filterChain.doFilter(request, response);
    }
}
