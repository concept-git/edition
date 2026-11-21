package io.edition.control.entry.http.problem;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** 把 Spring Security 等 Controller 之外发生的数据库故障保持为 503/504 problem。 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public final class DependencyFailureFilter extends OncePerRequestFilter {
    private final ProblemResponseWriter problems;

    DependencyFailureFilter(ProblemResponseWriter problems) {
        this.problems = problems;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            chain.doFilter(request, response);
        } catch (QueryTimeoutException timeout) {
            problems.writeDependencyFailure(request, response, timeout);
        } catch (DataAccessException unavailable) {
            if (!problems.writeDependencyFailure(request, response, unavailable)) throw unavailable;
        } catch (org.springframework.transaction.TransactionException failure) {
            if (!problems.writeDependencyFailure(request, response, failure)) throw failure;
        }
    }
}
