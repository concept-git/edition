package io.edition.control.adapters.inbound.http.permission;

import io.edition.control.adapters.inbound.http.problem.ApiProblem;
import io.edition.control.adapters.inbound.http.problem.ProblemResponses;
import io.edition.control.usecases.authoring.permission.PermissionVersionConflictException;
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
