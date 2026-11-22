package io.edition.control.adapters.inbound.http.page;

import io.edition.control.adapters.inbound.http.problem.ApiProblem;
import io.edition.control.adapters.inbound.http.problem.ProblemResponses;
import io.edition.control.usecases.authoring.pageediting.PageEditingTypes.EditConflictException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class PageExceptionHandler {
    private final ProblemResponses problems;

    PageExceptionHandler(ProblemResponses problems) {
        this.problems = problems;
    }

    @ExceptionHandler(EditConflictException.class)
    ResponseEntity<ApiProblem> editConflict(EditConflictException exception, HttpServletRequest request) {
        int revision = exception.currentRevision();
        String etag = PageEtag.of(revision);
        return problems.response(exception.code())
                .header("ETag", etag)
                .body(problems.body(exception.code(), request)
                        .withConflict(new ApiProblem.Conflict(
                                revision,
                                etag,
                                exception.theirs(),
                                exception.currentProfile() == null
                                        ? null
                                        : exception.currentProfile().contentType(),
                                exception.currentProfile() == null
                                        ? null
                                        : exception.currentProfile().versionRef(),
                                exception.currentProfile() == null
                                        ? null
                                        : exception.currentProfile().interpretation())));
    }
}
