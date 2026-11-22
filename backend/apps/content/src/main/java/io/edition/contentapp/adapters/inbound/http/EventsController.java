package io.edition.contentapp.adapters.inbound.http;

import io.edition.contentapp.adapters.inbound.observability.ContentAnalytics;
import io.edition.contentapp.usecases.access.ContentIdentity;
import io.edition.contentapp.usecases.ports.PublicationRead;
import io.edition.contentapp.usecases.shared.ContentProblem;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Set;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** 阅读前端上报页面浏览与未命中的信标；是否计入由 Reader 重新判定。 */
@RestController
public final class EventsController {
    private static final String PROBLEM = MediaType.APPLICATION_PROBLEM_JSON_VALUE;
    private static final Set<String> NOT_FOUND = Set.of("page_not_found", "space_not_found");
    private static final Set<String> RESOLVABLE =
            Set.of("ok", "redirect", "forbidden", "path_redirect", "home_redirect", "attachment");

    private final PublicationRead publication;
    private final ContentIdentity identity;
    private final ContentRequestOrigin origins;
    private final ContentAnalytics analytics;

    public EventsController(
            PublicationRead publication,
            ContentIdentity identity,
            ContentRequestOrigin origins,
            ContentAnalytics analytics) {
        this.publication = publication;
        this.identity = identity;
        this.origins = origins;
        this.analytics = analytics;
    }

    @PostMapping(value = "/api/content/events", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            operationId = "observePage",
            summary = "Record a page view or a missing path observed by the reading front-end")
    @ApiResponse(responseCode = "202", description = "Accepted without a database write", content = @Content)
    @ApiResponse(
            responseCode = "403",
            description = "Origin is not the site origin",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "404",
            description = "Site not found",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "422",
            description = "The path does not resolve to the reported kind",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "429",
            description = "Beacon rate limit; respect Retry-After",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "503",
            description = "Dependency unavailable",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    public ResponseEntity<Void> observe(@RequestBody PageEvent body, HttpServletRequest request) {
        var origin = origins.from(request);
        if (!origin.absolute(origin.host(), "").equals(request.getHeader("Origin")))
            throw new ContentProblem(403, "permission_denied");
        analytics.admit(origin.host(), request);
        if (body == null
                || body.path() == null
                || !body.path().startsWith("/")
                || body.path().length() > 512
                || body.path().chars().anyMatch(Character::isISOControl)
                || !Set.of("pv", "notfound").contains(String.valueOf(body.kind()))) {
            throw new ContentProblem(422, "validation_failed");
        }
        var read = publication.document(origin.host(), body.path(), identity.publicationCredential(request));
        if ("pv".equals(body.kind()) && "ok".equals(read.outcome()) && read.page() != null) {
            analytics.pageViewed(read.page().id(), read.page().path(), body.referrer(), request);
        } else if ("notfound".equals(body.kind()) && NOT_FOUND.contains(read.outcome())) {
            analytics.notFound(body.path(), body.referrer(), request);
        } else if (NOT_FOUND.contains(read.outcome()) || RESOLVABLE.contains(read.outcome())) {
            throw new ContentProblem(422, "validation_failed");
        } else {
            throw ContentProblem.publication(read.outcome());
        }
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .cacheControl(CacheControl.noStore())
                .build();
    }

    public record PageEvent(String kind, String path, String referrer) {}
}
