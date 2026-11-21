package io.edition.contentapp.entry.http;

import io.edition.contentapp.compositions.access.ContentIdentity;
import io.edition.contentapp.compositions.navigation.ContentNavigation;
import io.edition.contentapp.compositions.search.ContentSearch;
import io.edition.contentapp.compositions.shared.ContentProblem;
import io.edition.contentapp.compositions.shared.ServeResult;
import io.edition.contentapp.entry.observability.ContentAnalytics;
import io.edition.contentapp.entry.persistence.PublicationPages;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

/** 以 Host 为根的阅读 HTTP 适配器。只返回 JSON 与机器可读文本。 */
public @RestController final class ContentController {
    private static final MediaType XML = MediaType.parseMediaType("application/xml");
    private static final MediaType TEXT = MediaType.parseMediaType("text/plain;charset=UTF-8");

    private final PublicationPages publication;
    private final ContentIdentity identity;
    private final ContentAnalytics analytics;
    private final ContentNavigation navigation;
    private final ContentSearch search;
    private final ContentRequestOrigin origins;

    public ContentController(
            ContentNavigation navigation,
            ContentSearch search,
            ContentRequestOrigin origins,
            ContentAnalytics analytics,
            ContentIdentity identity,
            PublicationPages publication) {
        this.publication = publication;
        this.identity = identity;
        this.analytics = analytics;
        this.navigation = navigation;
        this.search = search;
        this.origins = origins;
    }

    public @GetMapping("/healthz") java.util.Map<String, String> health() {
        return java.util.Map.of("status", "UP");
    }

    public @GetMapping("/api/content/toc/{spaceSlug}") ResponseEntity<?> toc(
            @PathVariable String spaceSlug, HttpServletRequest request) {
        var origin = origins.from(request);
        return response(
                navigation.serveToc(origin.host(), spaceSlug, identity.publicationCredential(request)),
                request,
                origin);
    }

    public @io.swagger.v3.oas.annotations.Operation(
            operationId = "searchSite",
            summary = "Search current visible site content with a version-bound cursor") @io.swagger.v3.oas.annotations
            .responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "200",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation = SearchResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "409",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation = ContentErrors.Problem.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "422",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation = ContentErrors.Problem.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "503",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation = ContentErrors.Problem.class)))
    }) @GetMapping(value = "/api/content/search", produces = MediaType.APPLICATION_JSON_VALUE) ResponseEntity<
                    SearchResponse>
            search(
                    @io.swagger.v3.oas.annotations.Parameter(
                                    schema = @io.swagger.v3.oas.annotations.media.Schema(maxLength = 200))
                            @RequestParam(defaultValue = "")
                            String q,
                    @io.swagger.v3.oas.annotations.Parameter(
                                    schema = @io.swagger.v3.oas.annotations.media.Schema(minimum = "1", maximum = "20"))
                            @RequestParam(defaultValue = "10")
                            int limit,
                    @RequestParam(required = false) String cursor,
                    @RequestParam(required = false) String spaceSlug,
                    @RequestParam(required = false) String snapshot,
                    HttpServletRequest request) {
        var host = origins.from(request).host();
        var result =
                search.search(host, q, limit, cursor, spaceSlug, snapshot, identity.publicationCredential(request));
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(new SearchResponse(
                        result.query(), result.hits(), result.nextCursor(), proof(result, null, cursor == null)));
    }

    public @GetMapping(value = "/sitemap.xml", produces = "application/xml") ResponseEntity<?> sitemap(
            HttpServletRequest request) {
        var origin = origins.from(request);
        return response(navigation.serveSitemap(origin.host()), request, origin);
    }

    public @GetMapping(value = "/robots.txt", produces = "text/plain") ResponseEntity<?> robots(
            HttpServletRequest request) {
        var origin = origins.from(request);
        return response(navigation.serveRobots(origin.host()), request, origin);
    }

    private ResponseEntity<?> response(
            ServeResult result, HttpServletRequest request, io.edition.delivery.contract.ReaderOrigin origin) {
        return switch (result) {
            case ServeResult.Redirect redirect -> {
                String path = redirect.path() == null ? request.getRequestURI() : redirect.path();
                String host = redirect.host() == null ? origin.host() : redirect.host();
                String query = request.getQueryString() != null ? '?' + request.getQueryString() : "";
                yield ResponseEntity.status(redirect.status())
                        .location(java.net.URI.create(origin.absolute(host, path + query)))
                        .build();
            }
            case ServeResult.Toc toc ->
                ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(toc.nodes());
            case ServeResult.Sitemap sitemap -> sitemap(sitemap.paths(), origin);
            case ServeResult.Robots robots -> robots(robots.policy(), origin);
        };
    }

    private ResponseEntity<String> sitemap(List<String> paths, io.edition.delivery.contract.ReaderOrigin origin) {
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")
                .append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");
        for (String path : paths) {
            xml.append("<url><loc>")
                    .append(HtmlUtils.htmlEscape(origin.absolute(origin.host(), path)))
                    .append("</loc></url>");
        }
        return ResponseEntity.ok().contentType(XML).body(xml.append("</urlset>").toString());
    }

    private ResponseEntity<String> robots(String policy, io.edition.delivery.contract.ReaderOrigin origin) {
        String body = policy.equals("noindex")
                ? "User-agent: *\nDisallow: /\n"
                : "User-agent: *\nAllow: /\nSitemap: " + origin.absolute(origin.host(), "/sitemap.xml") + "\n";
        return ResponseEntity.ok().contentType(TEXT).body(body);
    }

    private String proof(ContentSearch.Result result, String previous, boolean initial) {
        return analytics.proof(
                result.query(),
                result.hits().stream().map(ContentSearch.Hit::path).toList(),
                result.error(),
                previous,
                initial);
    }

    public record SearchResponse(String query, List<ContentSearch.Hit> hits, String nextCursor, String trackingToken) {}

    public @org.springframework.web.bind.annotation.PostMapping("/api/content/search-events") @io.swagger.v3.oas
            .annotations.Operation(
            operationId = "observeSearch",
            summary = "Record an anonymous signed search observation without database writes") @org.springframework.web
                    .bind.annotation.ResponseStatus(
            HttpStatus.NO_CONTENT) @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "204",
                description = "Observation queued without a database write"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "403",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation = ContentErrors.Problem.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "404",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation = ContentErrors.Problem.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "422",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation = ContentErrors.Problem.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "503",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation = ContentErrors.Problem.class)))
    }) ResponseEntity<Void> searchEvent(
            @org.springframework.web.bind.annotation.RequestBody SearchEvent body, HttpServletRequest request) {
        var origin = origins.from(request);
        if (!origin.absolute(origin.host(), "").equals(request.getHeader("Origin")))
            throw new ContentProblem(403, "permission_denied");
        var read = publication.navigation(
                origin.host(), "robots", null, ContentIdentity.PublicationCredential.ANONYMOUS, String.class);
        if (!List.of("ok", "redirect").contains(read.outcome())) throw ContentProblem.publication(read.outcome());
        if (body == null) throw new ContentProblem(422, "validation_failed");
        if ("click".equals(body.kind())) analytics.click(body.proof(), body.path(), request);
        else if ("observable".equals(body.kind())) analytics.observed(body.proof(), request);
        else throw new ContentProblem(422, "validation_failed");
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }

    public record SearchEvent(String kind, String proof, String path) {}
}
