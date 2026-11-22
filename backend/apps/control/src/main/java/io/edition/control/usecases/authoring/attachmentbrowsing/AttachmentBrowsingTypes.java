package io.edition.control.usecases.authoring.attachmentbrowsing;

import static io.edition.control.usecases.authoring.attachmentbrowsing.AttachmentBrowsingTypes.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class AttachmentBrowsingTypes {
    private AttachmentBrowsingTypes() {}

    public record Entry(
            UUID id, UUID pageId, String pageTitle, String filename, String mime, long sizeBytes, Instant createdAt) {}

    public record Result(List<Entry> items, String nextCursor) {
        public Result {
            items = List.copyOf(items);
        }
    }
}
