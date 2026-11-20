package io.space.contentapp.entry.http;

import io.space.contentapp.compositions.resources.ContentFiles;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/** Shared byte-response headers for canonical addresses and snapshot reads. */
public final class ResourceResponse {
    private ResourceResponse() {}

    public static ResponseEntity<byte[]> content(ContentFiles.Content result) {
        return ResponseEntity.status(result.notModified() ? 304 : 200)
                .header(HttpHeaders.CACHE_CONTROL, "private, no-cache, must-revalidate")
                .header(HttpHeaders.VARY, "Authorization, Cookie")
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Security-Policy", "sandbox; default-src 'none'")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment")
                .eTag(result.sha256())
                .contentType(MediaType.parseMediaType(result.type()))
                .body(result.bytes());
    }
}
