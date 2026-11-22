package io.edition.contentapp.adapters.inbound.http;

import io.edition.contentapp.usecases.access.ContentIdentity;
import io.edition.contentapp.usecases.resources.ContentFiles;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** The original-byte representation of the same canonical resource address. */
public @RestController final class RawResourceController {
    private final ContentFiles files;
    private final ContentIdentity identity;
    private final ContentRequestOrigin origins;

    public RawResourceController(ContentFiles files, ContentIdentity identity, ContentRequestOrigin origins) {
        this.files = files;
        this.identity = identity;
        this.origins = origins;
    }

    public @GetMapping(value = "/{spaceSlug}/{*path}", params = "view=source") ResponseEntity<byte[]> source(
            @PathVariable String spaceSlug, @PathVariable String path, HttpServletRequest request) {
        var origin = origins.from(request);
        var credential = identity.publicationCredential(request);
        var mount = files.mount(origin.host(), spaceSlug, null, credential);
        var content = files.content(mount, path, request.getHeader(HttpHeaders.IF_NONE_MATCH));
        files.mount(origin.host(), spaceSlug, mount.snapshot(), credential);
        return ResourceResponse.content(content);
    }
}
