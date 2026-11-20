package io.space.control.compositions.releases.bundleexport;

import static io.space.control.compositions.releases.bundleexport.BundleExportTypes.*;

import io.space.concepts.bundleexport.api.*;
import io.space.concepts.objectstore.api.*;
import java.io.InputStream;
import java.time.*;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class BundleExportTypes {
    private BundleExportTypes() {}

    @io.swagger.v3.oas.annotations.media.Schema(name = "BundleExportJob")
    public record Job(
            UUID id,
            UUID releaseId,
            String status,
            int attempts,
            String error,
            String traceId,
            Instant createdAt,
            Instant expiresAt,
            Long bytes) {}

    @io.swagger.v3.oas.annotations.media.Schema(name = "BundleExportPage")
    public record Jobs(List<Job> items, String nextCursor) {
        public Jobs {
            items = List.copyOf(items);
        }
    }

    public record Download(InputStream stream, long bytes, String sha256, String filename) {}
}
