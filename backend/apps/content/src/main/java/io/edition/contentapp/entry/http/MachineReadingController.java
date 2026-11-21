package io.edition.contentapp.entry.http;

import io.edition.contentapp.compositions.access.ContentIdentity;
import io.edition.contentapp.compositions.machine.MachineReading;
import io.edition.contentapp.compositions.shared.ContentProblem;
import io.edition.contentapp.entry.persistence.PublicationPages;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** 固定地址的机器阅读 HTTP 适配器。 */
public @RestController final class MachineReadingController {
    private static final MediaType MARKDOWN = MediaType.parseMediaType("text/markdown;charset=UTF-8");

    private final MachineReading machine;
    private final ContentIdentity identity;
    private final ContentRequestOrigin origins;
    private final PublicationPages publication;

    public MachineReadingController(
            MachineReading machine,
            ContentIdentity identity,
            ContentRequestOrigin origins,
            PublicationPages publication) {
        this.machine = machine;
        this.identity = identity;
        this.origins = origins;
        this.publication = publication;
    }

    public @GetMapping(value = "/llms.txt", produces = "text/markdown") ResponseEntity<String> siteIndex(
            HttpServletRequest request) {
        var origin = origins.from(request);
        return publishedIndex(origin, null, request, identity.publicationCredential(request));
    }

    public @GetMapping(value = "/{spaceSlug}/llms.txt", produces = "text/markdown") ResponseEntity<String> spaceIndex(
            @PathVariable String spaceSlug, HttpServletRequest request) {
        var origin = origins.from(request);
        return publishedIndex(origin, spaceSlug, request, identity.publicationCredential(request));
    }

    public @GetMapping(value = "/{spaceSlug}/{*pageSlug}", params = "view=markdown", produces = "text/markdown")
    ResponseEntity<String> page(
            @PathVariable String spaceSlug, @PathVariable String pageSlug, HttpServletRequest request) {
        var origin = origins.from(request);
        return publishedPage(origin, "/" + spaceSlug + pageSlug, request, identity.publicationCredential(request));
    }

    private ResponseEntity<String> publishedPage(
            io.edition.delivery.contract.ReaderOrigin origin,
            String path,
            HttpServletRequest request,
            ContentIdentity.PublicationCredential credential) {
        var result =
                publication.read(origin.host(), path, credential.token(), credential.proof(), credential.session());
        return switch (result.outcome()) {
            case "ok" -> markdown(machine.markdown(result.page(), path));
            case "redirect" -> redirect(origin, result.primaryHost(), request);
            default -> throw ContentProblem.publication(result.outcome());
        };
    }

    private ResponseEntity<String> publishedIndex(
            io.edition.delivery.contract.ReaderOrigin origin,
            String slug,
            HttpServletRequest request,
            ContentIdentity.PublicationCredential credential) {
        var read = publication.machine(origin.host(), slug, credential);
        if ("redirect".equals(read.outcome())) return redirect(origin, read.primaryHost(), request);
        if (!"ok".equals(read.outcome())) throw ContentProblem.publication(read.outcome());
        var document = read.document();
        String absolute = origin.absolute(origin.host(), "");
        if (slug == null)
            return markdown(machine.siteIndex(read.brand(), document.spaces(), document.pages(), absolute));
        var space = document.spaces().stream()
                .filter(candidate -> candidate.slug().equals(slug))
                .findFirst()
                .orElseThrow(() -> new ContentProblem(404, "machine_index_not_found"));
        return markdown(machine.spaceIndex(read.brand(), space, document.pages(), absolute));
    }

    private static ResponseEntity<String> markdown(String body) {
        return ResponseEntity.ok()
                .contentType(MARKDOWN)
                .cacheControl(CacheControl.noStore())
                .body(body);
    }

    private static ResponseEntity<String> redirect(
            io.edition.delivery.contract.ReaderOrigin origin, String host, HttpServletRequest request) {
        String query = request.getQueryString() == null ? "" : "?" + request.getQueryString();
        return ResponseEntity.status(301)
                .location(URI.create(origin.absolute(host, request.getRequestURI() + query)))
                .build();
    }
}
