package io.space.control.entry.http.auth;

import io.space.control.entry.http.problem.ApiProblem;
import io.space.control.entry.http.problem.ProblemResponses;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class AuthExceptionHandler {
    private final ProblemResponses problems;

    AuthExceptionHandler(ProblemResponses problems) {
        this.problems = problems;
    }

    @ExceptionHandler(RateLimitedException.class)
    ResponseEntity<ApiProblem> rateLimited(RateLimitedException exception, HttpServletRequest request) {
        return problems.response(exception.code())
                .header("Retry-After", Long.toString(exception.retryAfter()))
                .body(problems.body(exception.code(), request));
    }
}
