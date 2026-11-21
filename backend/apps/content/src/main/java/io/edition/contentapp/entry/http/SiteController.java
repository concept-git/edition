package io.edition.contentapp.entry.http;

import io.edition.contentapp.compositions.access.ContentIdentity;
import io.edition.contentapp.compositions.access.ContentIdentity.PublicationCredential;
import io.edition.contentapp.compositions.site.ContentSite;
import io.edition.contentapp.compositions.site.ContentSite.PageResolution;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;
import tools.jackson.databind.json.JsonMapper;

/** 阅读前端消费的站点与页面数据接口；只返回数据，不渲染 HTML。 */
@RestController
@RequestMapping("/api/content")
public final class SiteController {
    private static final String PROBLEM = MediaType.APPLICATION_PROBLEM_JSON_VALUE;

    private final ContentSite site;
    private final ContentIdentity identity;
    private final ContentRequestOrigin origins;
    private final JsonMapper json;

    public SiteController(ContentSite site, ContentIdentity identity, ContentRequestOrigin origins, JsonMapper json) {
        this.site = site;
        this.identity = identity;
        this.origins = origins;
        this.json = json;
    }

    @GetMapping(value = "/site", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            operationId = "readSite",
            summary = "Read the site brand, mounted spaces and navigation visible to the caller")
    @ApiResponse(
            responseCode = "200",
            description = "Site description",
            content = @Content(schema = @Schema(implementation = ContentSite.SiteView.class)))
    @ApiResponse(responseCode = "304", description = "Cached representation is current", content = @Content)
    @ApiResponse(
            responseCode = "401",
            description = "Invalid or expired identity",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "404",
            description = "Site not found",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "503",
            description = "Dependency unavailable or access projection pending",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    public ResponseEntity<byte[]> site(
            @Parameter(
                            name = "If-None-Match",
                            in = ParameterIn.HEADER,
                            description = "Cached ETag; authorization always precedes 304")
                    @org.springframework.web.bind.annotation.RequestHeader(
                            value = HttpHeaders.IF_NONE_MATCH,
                            required = false)
                    String ifNoneMatch,
            HttpServletRequest request) {
        var credential = identity.publicationCredential(request);
        return represent(site.site(origins.from(request).host(), credential), credential, ifNoneMatch);
    }

    @GetMapping(
            value = {"/pages", "/pages/{*path}"},
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            operationId = "readPage",
            summary = "Resolve a canonical page path to page data, a redirect or an attachment location")
    @ApiResponse(
            responseCode = "200",
            description = "Page data; the body is rendered by the reading front-end",
            content = @Content(schema = @Schema(implementation = ContentSite.PageView.class)))
    @ApiResponse(responseCode = "301", description = "Primary host or moved path", content = @Content)
    @ApiResponse(responseCode = "302", description = "Space root resolved to its first page", content = @Content)
    @ApiResponse(
            responseCode = "303",
            description = "Attachment bytes are served by the snapshot content resource",
            content = @Content)
    @ApiResponse(responseCode = "304", description = "Authorized and current representation", content = @Content)
    @ApiResponse(
            responseCode = "401",
            description = "Invalid or expired identity",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "403",
            description = "Read forbidden",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "404",
            description = "Page not found",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "422",
            description = "Invalid path",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    @ApiResponse(
            responseCode = "503",
            description = "Dependency unavailable or access projection pending",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ContentErrors.Problem.class)))
    public ResponseEntity<byte[]> page(
            @PathVariable(required = false) String path,
            @Parameter(
                            name = "If-None-Match",
                            in = ParameterIn.HEADER,
                            description = "Cached ETag; authorization always precedes 304")
                    @org.springframework.web.bind.annotation.RequestHeader(
                            value = HttpHeaders.IF_NONE_MATCH,
                            required = false)
                    String ifNoneMatch,
            HttpServletRequest request) {
        var origin = origins.from(request);
        var credential = identity.publicationCredential(request);
        String requested = path == null || path.isEmpty() ? "/" : path;
        return switch (site.page(origin.host(), requested, credential)) {
            case PageResolution.Found found -> represent(found.page(), credential, ifNoneMatch);
            case PageResolution.Redirect redirect -> {
                String target = redirect.path() == null ? requested : redirect.path();
                String host = redirect.host() == null ? origin.host() : redirect.host();
                yield redirect(
                        redirect.status(),
                        URI.create(origin.absolute(host, UriUtils.encodePath(target, StandardCharsets.UTF_8))),
                        credential);
            }
            case PageResolution.File file ->
                redirect(
                        HttpStatus.SEE_OTHER.value(),
                        URI.create(UriComponentsBuilder.fromPath("/api/content/spaces/{space}/content")
                                .queryParam("snapshot", "{snapshot}")
                                .queryParam("path", "{path}")
                                .encode()
                                .buildAndExpand(file.space(), file.snapshot(), file.path())
                                .toUriString()),
                        credential);
        };
    }

    private ResponseEntity<byte[]> represent(Object body, PublicationCredential credential, String ifNoneMatch) {
        byte[] bytes = json.writeValueAsBytes(body);
        String etag = '"' + digest(bytes) + '"';
        boolean current = matches(ifNoneMatch, etag);
        var builder = (current ? ResponseEntity.status(HttpStatus.NOT_MODIFIED) : ResponseEntity.ok())
                .cacheControl(cache(credential))
                .header(HttpHeaders.VARY, "Cookie, Authorization")
                .eTag(etag);
        return current
                ? builder.build()
                : builder.contentType(MediaType.APPLICATION_JSON).body(bytes);
    }

    private static ResponseEntity<byte[]> redirect(int status, URI location, PublicationCredential credential) {
        return ResponseEntity.status(status)
                .location(location)
                .cacheControl(cache(credential))
                .header(HttpHeaders.VARY, "Cookie, Authorization")
                .build();
    }

    /** 带凭据的响应只允许私有缓存；两者都必须在复用前重新验证。 */
    private static CacheControl cache(PublicationCredential credential) {
        boolean credentialed = credential.token() != null || credential.proof() != null || credential.session() != null;
        return credentialed
                ? CacheControl.noCache().cachePrivate()
                : CacheControl.noCache().cachePublic();
    }

    private static boolean matches(String header, String etag) {
        if (header == null) return false;
        for (String candidate : header.split(",")) {
            String value = candidate.strip();
            if (value.equals("*") || value.equals(etag) || value.equals("W/" + etag)) return true;
        }
        return false;
    }

    private static String digest(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }
}
