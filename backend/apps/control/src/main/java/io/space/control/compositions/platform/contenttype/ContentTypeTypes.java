package io.space.control.compositions.platform.contenttype;

import static io.space.control.compositions.platform.contenttype.ContentTypeTypes.*;

import io.space.content.ContentTypeDefinition;
import java.time.Instant;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class ContentTypeTypes {
    private ContentTypeTypes() {}

    public record State(
            String contentType,
            boolean enabled,
            int revision,
            String activeVersionRef,
            String label,
            String format,
            String mediaType,
            boolean builtin) {}

    public record Version(
            String versionRef,
            String digest,
            ContentTypeDefinition definition,

            @io.swagger.v3.oas.annotations.media.Schema(nullable = true)
            Instant createdAt) {}

    public record VersionSummary(
            String versionRef,
            String contentType,
            String version,
            String digest,

            @io.swagger.v3.oas.annotations.media.Schema(nullable = true)
            Instant createdAt) {}

    public record TypeList(List<State> items, boolean canManage) {}

    public record VersionList(List<VersionSummary> items) {}
}
