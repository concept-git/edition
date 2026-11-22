package io.edition.control.modules.page.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/** Page 概念唯一出口；空间归属与 slug 由 Space 概念拥有。 */
public interface PageApi {
    int MAX_CONTENT_BYTES = 2 * 1024 * 1024;
    long MAX_ATTACHMENT_BYTES = 10L * 1024 * 1024;
    int MAX_ATTACHMENTS = 50;
    int MAX_PROPERTIES = 50;

    CreateResult create(Actor actor, Format format, String title);

    CreateResult create(Actor actor, Format format, String title, io.edition.content.ContentProfile profile);

    CreateResult create(Actor actor, Format format, String title, PageId id);

    EditResult edit(PageId page, String content, int baseRevision, Actor actor);

    EditResult edit(
            PageId page, String content, int baseRevision, Actor actor, io.edition.content.ContentProfile profile);

    MutationResult rename(PageId page, String title, Actor actor);

    MetadataResult setSeo(PageId page, SeoPatch patch, Actor actor);
    /** {@code icon} 为 null 即清空。 */
    MetadataResult setIcon(PageId page, String icon, Actor actor);

    MetadataResult setProperty(PageId page, String field, String value, Actor actor);

    CreateContentResult create(Actor actor, Format format, String title, PageId id, InitialContent initial);

    record InitialContent(
            String content, Seo seo, Map<String, String> properties, io.edition.content.ContentProfile contentProfile) {
        public InitialContent(String content, Seo seo, Map<String, String> properties) {
            this(content, seo, properties, null);
        }
    }

    sealed interface CreateContentResult {
        record Created(View page) implements CreateContentResult {}

        record InvalidTitle() implements CreateContentResult {}

        record IdTaken() implements CreateContentResult {}

        record ContentTooLarge() implements CreateContentResult {}

        record Invalid(String field, String code) implements CreateContentResult {}
    }

    MetadataResult replaceProperties(PageId page, Map<String, String> values, Actor actor);

    MetadataResult removeProperty(PageId page, String field, Actor actor);

    AttachResult attach(PageId page, FileUpload file, Actor actor);

    MetadataResult detach(PageId page, UUID ref, Actor actor);

    Optional<View> view(PageId page);

    List<View> views(Set<PageId> pages);

    Slice page(String cursor, int limit, Optional<Status> status, Optional<Format> format);

    Slice pageAll(String cursor, int limit);

    AttachmentScan scanAttachments(String cursor, int limit, String q, String type);

    record AttachmentEntry(
            UUID ref, UUID pageId, String pageTitle, String filename, String mime, long sizeBytes, Instant createdAt) {}

    record AttachmentScan(List<AttachmentEntry> items, int scanned, String nextCursor) {
        public AttachmentScan {
            items = List.copyOf(items);
        }
    }

    Optional<Attachment> attachment(PageId page, UUID ref);

    Optional<LifecycleChange> trash(PageId page, Actor actor);

    Optional<LifecycleChange> restore(PageId page, Actor actor);

    record LifecycleChange(View page, boolean changed) {
        public LifecycleChange {
            Objects.requireNonNull(page, "page");
        }
    }

    Optional<View> publish(PageId page, Actor actor);

    Optional<View> unpublish(PageId page, Actor actor);

    Slice trashed(String cursor, int limit);

    record PageId(UUID value) {
        public PageId {
            Objects.requireNonNull(value, "page id");
        }
    }

    record Actor(ActorType type, UUID id) {
        public Actor {
            Objects.requireNonNull(type, "actor type");
            if (type != ActorType.SYSTEM) Objects.requireNonNull(id, "actor id");
            if (type == ActorType.SYSTEM && id != null) {
                throw new IllegalArgumentException("system actor must not have an id");
            }
        }

        public static Actor user(UUID id) {
            return new Actor(ActorType.USER, id);
        }

        public static Actor apiToken(UUID id) {
            return new Actor(ActorType.API_TOKEN, id);
        }

        public static Actor system() {
            return new Actor(ActorType.SYSTEM, null);
        }
    }

    enum ActorType {
        USER,
        API_TOKEN,
        SYSTEM
    }

    enum Format {
        MARKDOWN,
        HTML,
        TXT,
        JSON,
        XML
    }

    enum Status {
        DRAFT,
        PUBLISHED
    }

    record Seo(String title, String description, String keywords, String ogImage, boolean noIndex) {
        public static Seo empty() {
            return new Seo(null, null, null, null, false);
        }
    }

    /** merge-patch 语义：Unchanged 保持、Clear 清空、Set 覆盖；noIndex 只有保持/覆盖两态。 */
    record SeoPatch(
            Patch<String> title,
            Patch<String> description,
            Patch<String> keywords,
            Patch<String> ogImage,
            Optional<Boolean> noIndex) {
        public SeoPatch {
            Objects.requireNonNull(title, "title patch");
            Objects.requireNonNull(description, "description patch");
            Objects.requireNonNull(keywords, "keywords patch");
            Objects.requireNonNull(ogImage, "ogImage patch");
            Objects.requireNonNull(noIndex, "noIndex patch");
        }

        public boolean isEmpty() {
            return title instanceof Patch.Unchanged<?>
                    && description instanceof Patch.Unchanged<?>
                    && keywords instanceof Patch.Unchanged<?>
                    && ogImage instanceof Patch.Unchanged<?>
                    && noIndex.isEmpty();
        }
    }

    sealed interface Patch<T> {
        record Unchanged<T>() implements Patch<T> {}

        record Clear<T>() implements Patch<T> {}

        record Set<T>(T value) implements Patch<T> {
            public Set {
                Objects.requireNonNull(value, "patch value");
            }
        }

        static <T> Patch<T> unchanged() {
            return new Unchanged<>();
        }

        static <T> Patch<T> clear() {
            return new Clear<>();
        }

        static <T> Patch<T> set(T value) {
            return new Set<>(value);
        }
    }

    /** 附件引用：ref 是稳定 id；storageKey = sha256(bytes)，供对象存储按内容寻址。 */
    record Attachment(UUID ref, String filename, String mime, long sizeBytes, String storageKey, Instant createdAt) {}

    /** 上传文件：类型不信任声明，由概念按文件头嗅探。 */
    record FileUpload(String filename, byte[] bytes) {
        public FileUpload {
            Objects.requireNonNull(filename, "filename");
            Objects.requireNonNull(bytes, "bytes");
        }
    }

    record View(
            UUID id,
            String title,
            Format format,
            String content,
            int revision,
            Status status,
            Seo seo,
            String icon,
            Map<String, String> properties,
            List<Attachment> attachments,
            Instant trashedAt,
            Instant createdAt,
            Actor createdBy,
            Instant updatedAt,
            Actor updatedBy,
            io.edition.content.ContentProfile contentProfile) {
        public View(
                UUID id,
                String title,
                Format format,
                String content,
                int revision,
                Status status,
                Seo seo,
                String icon,
                Map<String, String> properties,
                List<Attachment> attachments,
                Instant trashedAt,
                Instant createdAt,
                Actor createdBy,
                Instant updatedAt,
                Actor updatedBy) {
            this(
                    id,
                    title,
                    format,
                    content,
                    revision,
                    status,
                    seo,
                    icon,
                    properties,
                    attachments,
                    trashedAt,
                    createdAt,
                    createdBy,
                    updatedAt,
                    updatedBy,
                    io.edition.content.ContentProfile.defaults(format.name()));
        }

        public View {
            contentProfile =
                    contentProfile == null ? io.edition.content.ContentProfile.defaults(format.name()) : contentProfile;
            properties = Map.copyOf(properties);
            attachments = List.copyOf(attachments);
        }
    }

    record Slice(List<View> items, String nextCursor) {
        public Slice {
            items = List.copyOf(items);
        }
    }

    sealed interface CreateResult {
        record Created(View page) implements CreateResult {}

        record InvalidTitle() implements CreateResult {}

        record IdTaken() implements CreateResult {}
    }

    sealed interface EditResult {
        record Edited(View page) implements EditResult {}

        record Conflict(View theirs) implements EditResult {}

        record NotFound() implements EditResult {}

        record ContentTooLarge() implements EditResult {}
    }

    sealed interface MutationResult {
        record Changed(View page) implements MutationResult {}

        record NotFound() implements MutationResult {}

        record InvalidTitle() implements MutationResult {}
    }

    /** 元数据动作的有限输出：Invalid 携带违反字段与稳定 code（组合层映射 validation_failed）。 */
    sealed interface MetadataResult {
        record Changed(View page) implements MetadataResult {}

        record NotFound() implements MetadataResult {}

        record Invalid(String field, String code) implements MetadataResult {}
    }

    sealed interface AttachResult {
        record Attached(View page, Attachment attachment) implements AttachResult {}

        record NotFound() implements AttachResult {}

        record FileTooLarge() implements AttachResult {}

        record FileTypeUnsupported() implements AttachResult {}

        record TooManyAttachments() implements AttachResult {}

        record Invalid(String field, String code) implements AttachResult {}
    }

    boolean purge(PageId page, java.time.Duration retention);

    void terminate(PageId page);

    boolean referencesObject(String key);

    List<PageId> expired(java.time.Instant before, UUID after, int limit);

    Optional<View> lock(PageId page);

    Usage usage(Set<UUID> ids);

    record Usage(
            long workingPages,
            long trashedPages,
            long publishedPages,
            long workingTextBytes,
            long trashedTextBytes,
            long attachmentCount,
            long attachmentBytes) {}
}
