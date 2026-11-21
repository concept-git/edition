package io.edition.contentapp.entry.http;

import io.edition.contentapp.compositions.shared.ContentProblem;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataAccessException;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** 阅读错误一律返回 RFC 9457 problem+json。 */
@RestControllerAdvice
public final class ContentErrors {
    public @ExceptionHandler(ContentProblem.class) ResponseEntity<?> problem(
            ContentProblem error, HttpServletRequest request) {
        return response(error.status, error.code, request);
    }

    public @ExceptionHandler(DataAccessException.class) ResponseEntity<?> database(
            DataAccessException error, HttpServletRequest request) {
        return response(503, "delivery_unavailable", request);
    }

    public @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    ResponseEntity<?> validation(RuntimeException error, HttpServletRequest request) {
        return response(422, "validation_failed", request);
    }

    public @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class) ResponseEntity<?>
            malformedBody(Exception error, HttpServletRequest request) {
        return response(422, "validation_failed", request);
    }

    public @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class) ResponseEntity<
                    ?>
            missing(Exception error, HttpServletRequest request) {
        return response(422, "validation_failed", request);
    }

    public @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class) ResponseEntity<?>
            method(Exception error, HttpServletRequest request) {
        return response(405, "method_not_allowed", request);
    }

    public @ExceptionHandler(RuntimeException.class) ResponseEntity<?> unexpected(
            RuntimeException error, HttpServletRequest request) {
        org.slf4j.LoggerFactory.getLogger(getClass())
                .error("reader invariant failed traceId={}", request.getAttribute("traceId"), error);
        return response(500, "unexpected_error", request);
    }

    private ResponseEntity<?> response(int status, String code, HttpServletRequest request) {
        String trace = Optional.ofNullable((String) request.getAttribute("traceId"))
                .orElseGet(() -> UUID.randomUUID().toString());
        String message =
                switch (code) {
                    case "access_update_pending" -> "Access permissions are being updated. Please retry shortly.";
                    case "site_not_online" -> "This site is not online yet. Please retry shortly.";
                    case "invalid_token" -> "The machine credential is invalid, expired or revoked.";
                    case "read_forbidden" -> "This identity cannot read the requested resource.";
                    case "snapshot_changed" ->
                        "Snapshot or access changed. Obtain a new snapshot and restart pagination.";
                    case "search_preparing" -> "Search has not reached this snapshot. Retry shortly.";
                    case "content_too_large", "read_limit_exceeded", "search_limit_exceeded" ->
                        "The request exceeds the advertised reading limit.";
                    case "not_a_file" -> "Select a file path.";
                    case "method_not_allowed" -> "Only read methods are supported.";
                    case "search_changed" -> "Content changed. Please search again.";
                    case "cursor_invalid", "validation_failed" ->
                        "Check the search query or restart from the first page.";
                    default ->
                        status == 404
                                ? "The requested content was not found."
                                : "The service is temporarily unavailable. Please retry or report the trace ID.";
                };
        var builder = ResponseEntity.status(status)
                .cacheControl(CacheControl.noStore())
                .header("X-Request-Id", trace);
        if (status == 429 || status == 503) builder.header("Retry-After", "2");
        return builder.contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(new Problem(
                        "about:blank",
                        status,
                        code,
                        HttpStatus.valueOf(status).getReasonPhrase(),
                        message,
                        trace,
                        List.of()));
    }

    public record Violation(String field, String code) {}

    public record Problem(
            String type,
            int status,
            String code,
            String title,
            String detail,
            String traceId,
            List<Violation> violations) {}
}
