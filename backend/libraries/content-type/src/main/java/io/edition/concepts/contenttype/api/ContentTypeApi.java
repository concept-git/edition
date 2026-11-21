package io.edition.concepts.contenttype.api;

import io.edition.content.*;
import java.time.Instant;
import java.util.*;

public interface ContentTypeApi {
    List<State> list();

    Optional<State> state(String contentType);

    List<VersionSummary> versions(String contentType);

    Optional<Version> version(String versionRef);

    Optional<Version> matching(String contentType, String digest);

    Version registerVersion(String contentType, int baseRevision, ContentTypeDefinition definition);

    State activate(String contentType, int baseRevision, String versionRef);

    State deactivate(String contentType, int baseRevision);

    ContentTypeSnapshot resolve(String contentType, String versionRef, boolean requireEnabled);

    Optional<String> formatOf(String contentType);

    List<Implementation> implementations();

    record State(
            String contentType,
            boolean enabled,
            int revision,
            String activeVersionRef,
            String label,
            String format,
            String mediaType,
            boolean builtin) {}

    record Version(String versionRef, String digest, ContentTypeDefinition definition, Instant createdAt) {
        public ContentTypeSnapshot snapshot() {
            return new ContentTypeSnapshot(versionRef, digest, definition);
        }
    }

    record VersionSummary(String versionRef, String contentType, String version, String digest, Instant createdAt) {}

    record Implementation(
            String id,
            String name,
            String version,
            List<String> contentTypes,
            List<String> formats,
            List<String> capabilities,
            boolean trusted) {}

    final class Invalid extends RuntimeException {
        public final String field;
        public final String reason;

        public Invalid(String field, String reason) {
            this.field = field;
            this.reason = reason;
        }
    }

    final class Conflict extends RuntimeException {
        public final int revision;

        public Conflict(int revision) {
            this.revision = revision;
        }
    }

    final class Missing extends RuntimeException {}
}
