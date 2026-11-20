package io.space.control.entry.http.permission;

import io.space.control.compositions.authoring.permission.PermissionVersionConflictException;
import io.space.control.entry.http.problem.ApiProblem;
import io.space.control.entry.http.problem.ProblemResponses;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class PermissionExceptionHandler {
    private final ProblemResponses problems;

    PermissionExceptionHandler(ProblemResponses problems) {
        this.problems = problems;
    }

    @ExceptionHandler(PermissionVersionConflictException.class)
    ResponseEntity<ApiProblem> permissionVersionConflict(
            PermissionVersionConflictException exception, HttpServletRequest request) {
        return problems.response(exception.code())
                .header("ETag", PermissionEtag.of(exception.currentRevision()))
                .body(problems.body(exception.code(), request));
    }
}
