package io.edition.control.adapters.inbound.http.problem;

import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/** Shared RFC 9457 response assembly for gateway exception handlers. */
@Component
public final class ProblemResponses {
    private final RequestTrace requestTrace;

    ProblemResponses(RequestTrace requestTrace) {
        this.requestTrace = requestTrace;
    }

    public String traceId(HttpServletRequest request) {
        return requestTrace.traceId(request);
    }

    public ResponseEntity.BodyBuilder response(ProblemCode code) {
        return ResponseEntity.status(ProblemCatalog.of(code).status()).contentType(MediaType.APPLICATION_PROBLEM_JSON);
    }

    public ApiProblem body(ProblemCode code, HttpServletRequest request) {
        var spec = ProblemCatalog.of(code);
        return ApiProblem.of(spec.status().value(), code, spec.title(), spec.detail(), requestTrace.traceId(request));
    }

    public ResponseEntity<ApiProblem> problem(
            ProblemCode code, HttpServletRequest request, List<ValidationViolation> violations) {
        return response(code).body(body(code, request).withViolations(violations(violations)));
    }

    public static List<ApiProblem.Violation> violations(List<ValidationViolation> violations) {
        return violations.stream()
                .map(violation -> new ApiProblem.Violation(violation.field(), violation.code()))
                .toList();
    }
}
