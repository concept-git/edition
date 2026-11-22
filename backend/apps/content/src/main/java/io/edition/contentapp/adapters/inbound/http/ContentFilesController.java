package io.edition.contentapp.adapters.inbound.http;

import io.edition.contentapp.usecases.access.ContentIdentity;
import io.edition.contentapp.usecases.resources.ContentFiles;
import io.edition.contentapp.usecases.shared.ContentProblem;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@io.swagger.v3.oas.annotations.responses.ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Read result"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Invalid or expired identity",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ContentErrors.Problem.class))),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Read forbidden",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ContentErrors.Problem.class))),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Resource not found",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ContentErrors.Problem.class))),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409",
            description = "Snapshot or permissions changed; restart",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ContentErrors.Problem.class))),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "413",
            description = "Content exceeds maxContentBytes",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ContentErrors.Problem.class))),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "422",
            description = "Invalid argument or cursor",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ContentErrors.Problem.class))),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "429",
            description = "Concurrent read limit; respect Retry-After",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ContentErrors.Problem.class))),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "503",
            description = "Dependency unavailable or access projection pending",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ContentErrors.Problem.class)))
})
@RestController
@RequestMapping("/api/content/spaces/{spaceSlug}")
public final class ContentFilesController {
    private final ContentFiles files;
    private final ContentIdentity identity;
    private final ContentRequestOrigin origins;

    public ContentFilesController(ContentFiles files, ContentIdentity identity, ContentRequestOrigin origins) {
        this.files = files;
        this.identity = identity;
        this.origins = origins;
    }

    public @io.swagger.v3.oas.annotations.Parameter(
            name = "Authorization",
            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
            description = "Optional Bearer space API Token; invalid credentials never become anonymous.") @GetMapping(
            value = "/snapshot",
            produces = MediaType.APPLICATION_JSON_VALUE) ResponseEntity<ContentFiles.Snapshot> snapshot(
            @PathVariable String spaceSlug, HttpServletRequest request) {
        return json(files.describe(mount(spaceSlug, null, request)));
    }

    public @io.swagger.v3.oas.annotations.Parameter(
            name = "Authorization",
            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
            description = "Optional Bearer space API Token; invalid credentials never become anonymous.") @GetMapping(
            value = "/files",
            produces = MediaType.APPLICATION_JSON_VALUE) ResponseEntity<ContentFiles.Listing> list(
            @PathVariable String spaceSlug,
            @RequestParam String snapshot,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(required = false) String cursor,
            HttpServletRequest request) {
        var mount = mount(spaceSlug, snapshot, request);
        var result = files.list(mount, limit, cursor);
        recheck(mount, spaceSlug, snapshot, request);
        return json(result);
    }

    public @io.swagger.v3.oas.annotations.Parameter(
            name = "Authorization",
            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
            description = "Optional Bearer space API Token; invalid credentials never become anonymous.") @GetMapping(
            value = "/stat",
            produces = MediaType.APPLICATION_JSON_VALUE) ResponseEntity<ContentFiles.Entry> stat(
            @PathVariable String spaceSlug,
            @RequestParam String snapshot,
            @RequestParam String path,
            HttpServletRequest request) {
        var mount = mount(spaceSlug, snapshot, request);
        var result = files.stat(mount, path);
        recheck(mount, spaceSlug, snapshot, request);
        return json(result);
    }

    public @io.swagger.v3.oas.annotations.Parameter(
            name = "Authorization",
            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
            description = "Optional Bearer space API Token; invalid credentials never become anonymous.") @GetMapping(
            value = "/toc",
            produces = MediaType.APPLICATION_JSON_VALUE) ResponseEntity<ContentFiles.Toc> toc(
            @PathVariable String spaceSlug, @RequestParam String snapshot, HttpServletRequest request) {
        var mount = mount(spaceSlug, snapshot, request);
        var result = files.toc(mount);
        recheck(mount, spaceSlug, snapshot, request);
        return json(result);
    }

    public @io.swagger.v3.oas.annotations.Parameter(
            name = "If-None-Match",
            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
            description = "Cached byte SHA-256 ETag; authorization and snapshot checks always precede 304") @io.swagger
            .v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Raw file bytes; Content-Type follows the file format",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "*/*",
                            schema = @io.swagger.v3.oas.annotations.media.Schema(type = "string", format = "binary")))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "304",
            description = "Authorized, current snapshot and matching SHA-256 ETag",
            content = @io.swagger.v3.oas.annotations.media.Content) @io.swagger.v3.oas.annotations.Parameter(
            name = "Authorization",
            in = io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,
            description = "Optional Bearer space API Token; invalid credentials never become anonymous.") @GetMapping(
            "/content") ResponseEntity<byte[]> content(
            @PathVariable String spaceSlug,
            @RequestParam String snapshot,
            @RequestParam String path,
            HttpServletRequest request) {
        var mount = mount(spaceSlug, snapshot, request);
        var result = files.content(mount, path, request.getHeader(HttpHeaders.IF_NONE_MATCH));
        recheck(mount, spaceSlug, snapshot, request);
        return ResourceResponse.content(result);
    }

    private ContentFiles.Mount mount(String slug, String snapshot, HttpServletRequest request) {
        var origin = origins.from(request);
        return files.mount(origin.host(), slug, snapshot, identity.publicationCredential(request));
    }

    private void recheck(ContentFiles.Mount original, String slug, String snapshot, HttpServletRequest request) {
        var current = mount(slug, snapshot, request);
        if (!current.binding().equals(original.binding())) throw new ContentProblem(409, "snapshot_changed");
    }

    private static <T> ResponseEntity<T> json(T body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body);
    }
}
