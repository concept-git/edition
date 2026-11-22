package io.edition.control.adapters.inbound.http.problem;

import io.edition.control.usecases.flow.ProblemCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.sql.SQLNonTransientConnectionException;
import java.sql.SQLTransientConnectionException;
import java.util.ArrayDeque;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.Set;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.dao.RecoverableDataAccessException;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionSystemException;
import tools.jackson.databind.json.JsonMapper;

/** 在 Spring Security filter 链内写出与 ControllerAdvice 相同的 problem+json 协议。 */
@Component
public final class ProblemResponseWriter {

    private final JsonMapper jsonMapper;
    private final RequestTrace requestTrace;

    public ProblemResponseWriter(JsonMapper jsonMapper, RequestTrace requestTrace) {
        this.jsonMapper = jsonMapper;
        this.requestTrace = requestTrace;
    }

    public void write(
            HttpServletRequest request,
            HttpServletResponse response,
            int status,
            ProblemCode code,
            String title,
            String detail)
            throws IOException {
        var traceId = requestTrace.traceId(request);
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        jsonMapper.writeValue(response.getOutputStream(), ApiProblem.of(status, code, title, detail, traceId));
    }

    /**
     * Filter 链中的依赖故障不会经过 ControllerAdvice；在安全过滤器入口复用同一 RFC 9457 语义。 返回 false
     * 表示并非已分类依赖故障，调用方应继续原有异常处理。
     */
    public boolean writeDependencyFailure(HttpServletRequest request, HttpServletResponse response, Throwable failure)
            throws IOException {
        var problem = dependencyProblem(failure);
        if (problem == null) {
            return false;
        }
        write(request, response, problem.status(), problem.code(), problem.title(), problem.detail());
        return true;
    }

    public static DependencyProblem dependencyProblem(Throwable failure) {
        var pending = new ArrayDeque<Throwable>();
        var seen = Collections.newSetFromMap(new IdentityHashMap<Throwable, Boolean>());
        pending.add(failure);
        while (!pending.isEmpty()) {
            Throwable cause = pending.removeFirst();
            if (!seen.add(cause)) continue;
            if (cause.getCause() != null) pending.addLast(cause.getCause());
            if (cause instanceof TransactionSystemException transaction
                    && transaction.getApplicationException() != null)
                pending.addFirst(transaction.getApplicationException());
            if (cause instanceof QueryTimeoutException) {
                return new DependencyProblem(
                        HttpServletResponse.SC_GATEWAY_TIMEOUT,
                        ProblemCode.DEPENDENCY_TIMEOUT,
                        "Dependency timed out",
                        "A required dependency did not respond in time.");
            }
            if (cause instanceof DataAccessResourceFailureException
                    || cause instanceof TransientDataAccessException
                    || cause instanceof RecoverableDataAccessException
                    || cause instanceof SQLTransientConnectionException
                    || cause instanceof SQLNonTransientConnectionException
                    || (cause instanceof SQLException sql
                            && sql.getSQLState() != null
                            && (sql.getSQLState().startsWith("08")
                                    || Set.of("57P01", "57P02", "57P03").contains(sql.getSQLState())))) {
                return new DependencyProblem(
                        HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                        ProblemCode.DEPENDENCY_UNAVAILABLE,
                        "Dependency unavailable",
                        "A required dependency is temporarily unavailable.");
            }
        }
        return null;
    }

    public record DependencyProblem(int status, ProblemCode code, String title, String detail) {}
}
