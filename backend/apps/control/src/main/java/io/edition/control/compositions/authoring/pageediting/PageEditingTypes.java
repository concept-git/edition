package io.edition.control.compositions.authoring.pageediting;

import static io.edition.control.compositions.authoring.pageediting.PageEditingTypes.*;

import com.fasterxml.jackson.annotation.JsonValue;
import io.edition.concepts.page.api.PageApi;
import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class PageEditingTypes {
    private PageEditingTypes() {}

    public record AttachmentContent(java.io.InputStream stream, String filename, String mime, long sizeBytes) {}

    public record PagePage(List<PageSummary> items, String nextCursor, Long total, Set<Action> allowedActions) {
        public PagePage {
            items = List.copyOf(items);
            allowedActions = Set.copyOf(allowedActions);
        }
    }

    public record PageSummary(
            UUID id,
            String title,
            String slug,
            String status,
            String format,
            @Schema(nullable = true) String icon,
            List<String> tags,
            boolean driftFlag,
            Instant updatedAt,
            UUID updatedBy,
            @Schema(nullable = true) Instant publishedAt,
            Set<Action> allowedActions,
            String contentType,
            String versionRef,
            Map<String, Object> interpretation) {
        public io.edition.content.ContentProfile contentProfile() {
            return new io.edition.content.ContentProfile(
                    contentType == null ? format.toLowerCase(java.util.Locale.ROOT) : contentType,
                    versionRef,
                    interpretation);
        }
    }

    public record PageDetail(
            UUID id,
            String title,
            String slug,
            String status,
            String format,
            @Schema(nullable = true) String icon,
            List<String> tags,
            boolean driftFlag,
            Instant updatedAt,
            UUID updatedBy,
            @Schema(nullable = true) Instant publishedAt,
            Set<Action> allowedActions,
            String content,
            int revision,
            Seo seo,
            Map<String, String> properties,
            List<Attachment> attachments,
            @Schema(nullable = true) Instant trashedAt,
            long revisionCount,
            long wordCount,
            long readingTime,
            String contentType,
            String versionRef,
            Map<String, Object> interpretation) {
        public io.edition.content.ContentProfile contentProfile() {
            return new io.edition.content.ContentProfile(
                    contentType == null ? format.toLowerCase(java.util.Locale.ROOT) : contentType,
                    versionRef,
                    interpretation);
        }
    }

    public record Seo(
            @Schema(nullable = true) String title,
            @Schema(nullable = true) String description,
            @Schema(nullable = true) String keywords,
            @Schema(nullable = true) String ogImage,
            boolean noIndex) {}

    public record Attachment(UUID id, String filename, String mime, long sizeBytes, String contentPath) {}

    public record AttachmentLink(String url, Instant expiresAt, String filename, String mime, long sizeBytes) {}

    public record SeoPatch(
            PageApi.Patch<String> title,
            PageApi.Patch<String> description,
            PageApi.Patch<String> keywords,
            PageApi.Patch<String> ogImage,
            Optional<Boolean> noIndex) {
        public SeoPatch {
            title = title == null ? PageApi.Patch.unchanged() : title;
            description = description == null ? PageApi.Patch.unchanged() : description;
            keywords = keywords == null ? PageApi.Patch.unchanged() : keywords;
            ogImage = ogImage == null ? PageApi.Patch.unchanged() : ogImage;
            noIndex = noIndex == null ? Optional.empty() : noIndex;
        }

        public static SeoPatch fromJson(
                boolean titlePresent,
                String title,
                boolean descriptionPresent,
                String description,
                boolean keywordsPresent,
                String keywords,
                boolean ogImagePresent,
                String ogImage,
                Boolean noIndex) {
            return new SeoPatch(
                    field(titlePresent, title),
                    field(descriptionPresent, description),
                    field(keywordsPresent, keywords),
                    field(ogImagePresent, ogImage),
                    Optional.ofNullable(noIndex));
        }

        boolean isEmpty() {
            return toConcept().isEmpty();
        }

        PageApi.SeoPatch toConcept() {
            return new PageApi.SeoPatch(title, description, keywords, ogImage, noIndex);
        }

        String canonical() {
            return IdempotentFlowExecutor.canonical(
                    canonical(title),
                    canonical(description),
                    canonical(keywords),
                    canonical(ogImage),
                    noIndex.map(String::valueOf).orElse(null));
        }

        private static PageApi.Patch<String> field(boolean present, String value) {
            if (!present) return PageApi.Patch.unchanged();
            return value == null ? PageApi.Patch.clear() : PageApi.Patch.set(value);
        }

        private static String canonical(PageApi.Patch<String> patch) {
            return switch (patch) {
                case PageApi.Patch.Unchanged<String> ignored -> null;
                case PageApi.Patch.Clear<String> ignored -> "";
                case PageApi.Patch.Set<String> set -> "=" + set.value().strip();
            };
        }
    }

    public enum EditIntent {
        DRAFT_ONLY,
        HOTFIX;

        @JsonValue
        public String value() {
            return name().toLowerCase(Locale.ROOT);
        }
    }

    public enum ReadView {
        SUMMARY,
        CONTENT;

        @JsonValue
        public String value() {
            return name().toLowerCase(Locale.ROOT);
        }
    }

    public enum ReadStatus {
        OK,
        NOT_FOUND;

        @JsonValue
        public String value() {
            return name().toLowerCase(Locale.ROOT);
        }
    }

    public record ContentSnapshot(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID id,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String format,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String content,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            int revision,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String contentType,

            @Schema(nullable = true, requiredMode = Schema.RequiredMode.REQUIRED)
            String versionRef,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            Map<String, Object> interpretation) {
        static ContentSnapshot of(PageApi.View page) {
            return new ContentSnapshot(
                    page.id(),
                    page.format().name().toLowerCase(Locale.ROOT),
                    page.content(),
                    page.revision(),
                    page.contentProfile().contentType(),
                    page.contentProfile().versionRef(),
                    page.contentProfile().interpretation());
        }
    }

    public record BatchPage(UUID id, ReadStatus status, PageSummary page, ContentSnapshot content) {}

    public record BatchPages(List<BatchPage> items) {}

    public record Preview(String html) {}

    public record ActorView(String type, UUID id, String displayName, String status) {}

    public record RevisionEntry(
            int n, ActorView actor, Instant createdAt, String note, long sizeBytes, long sizeDelta) {}

    public record RevisionDetail(
            int n,
            ActorView actor,
            Instant createdAt,
            String note,
            long sizeBytes,
            long sizeDelta,
            String content,
            String contentType,
            String versionRef,
            Map<String, Object> interpretation) {
        public io.edition.content.ContentProfile contentProfile() {
            return contentType == null
                    ? null
                    : new io.edition.content.ContentProfile(contentType, versionRef, interpretation);
        }
    }

    public record RevisionPage(List<RevisionEntry> items, String nextCursor) {
        public RevisionPage {
            items = List.copyOf(items);
        }
    }

    public record RevisionDiff(int from, int to, List<DiffHunk> hunks) {
        public RevisionDiff {
            hunks = List.copyOf(hunks);
        }
    }

    public record DiffHunk(int oldStart, int oldLines, int newStart, int newLines, List<DiffLine> lines) {
        public DiffHunk {
            lines = List.copyOf(lines);
        }
    }

    public record DiffLine(String type, String content) {}

    public enum Action {
        CREATE("create"),
        READ("read"),
        RENAME("rename"),
        EDIT("edit"),
        REVERT("revert"),
        RESLUG("reslug"),
        TRANSFER("transfer"),
        PUBLISH("publish"),
        UNPUBLISH("unpublish");
        private final String value;

        Action(String value) {
            this.value = value;
        }

        @JsonValue
        public String value() {
            return value;
        }
    }

    public static final class RevisionNotFoundException extends FlowException {
        public RevisionNotFoundException() {
            super(ProblemCode.REVISION_NOT_FOUND);
        }
    }

    public static final class SlugInvalidException extends FlowException {
        public SlugInvalidException() {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("slug", "invalid_format")));
        }
    }

    public static final class SlugTakenException extends FlowException {
        public SlugTakenException() {
            super(ProblemCode.SLUG_TAKEN);
        }
    }

    public static final class PageTitleInvalidException extends FlowException {
        public PageTitleInvalidException() {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("title", "invalid_format")));
        }
    }

    public static final class PageContentTooLargeException extends FlowException {
        public PageContentTooLargeException() {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("content", "too_large")));
        }
    }

    public static final class FormatInvalidException extends FlowException {
        public FormatInvalidException() {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("format", "invalid_format")));
        }
    }

    public static final class MetadataInvalidException extends FlowException {
        public MetadataInvalidException(String field, String code) {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, code)));
        }
    }

    public static final class FileTooLargeException extends FlowException {
        public FileTooLargeException() {
            super(ProblemCode.FILE_TOO_LARGE);
        }
    }

    public static final class FileTypeUnsupportedException extends FlowException {
        public FileTypeUnsupportedException() {
            super(ProblemCode.FILE_TYPE_UNSUPPORTED);
        }
    }

    public static final class TooManyAttachmentsException extends FlowException {
        public TooManyAttachmentsException() {
            super(ProblemCode.TOO_MANY_ATTACHMENTS);
        }
    }

    public static final class AttachmentNotFoundException extends FlowException {
        public AttachmentNotFoundException() {
            super(ProblemCode.ATTACHMENT_NOT_FOUND);
        }
    }

    public static final class ObjectStoreUnavailableException extends FlowException {
        public ObjectStoreUnavailableException(Throwable cause) {
            super(ProblemCode.DEPENDENCY_UNAVAILABLE);
            initCause(cause);
        }
    }

    public static final class EditConflictException extends FlowException {
        private final String theirs;
        private final int currentRevision;
        private final io.edition.content.ContentProfile currentProfile;

        public EditConflictException(String theirs, int currentRevision) {
            this(theirs, currentRevision, null);
        }

        public EditConflictException(String theirs, int currentRevision, io.edition.content.ContentProfile profile) {
            super(ProblemCode.EDIT_CONFLICT);
            this.theirs = theirs;
            this.currentRevision = currentRevision;
            this.currentProfile = profile;
        }

        public io.edition.content.ContentProfile currentProfile() {
            return currentProfile;
        }

        public String theirs() {
            return theirs;
        }

        public int currentRevision() {
            return currentRevision;
        }
    }
}
