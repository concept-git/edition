package io.edition.concepts.page.domain;

import io.edition.concepts.page.api.*;
import io.edition.concepts.page.api.PageApi;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Page aggregate：工作稿、内容基线、元数据（SEO / 图标 / 属性 / 附件引用）与页面自身生命周期的不变量集中于此。
 * 元数据动作只改自身字段：不递增 revision，后写覆盖。
 */
public final class Page {
    public static final int MAX_CONTENT_BYTES = PageApi.MAX_CONTENT_BYTES;

    private final UUID id;
    private PageTitle title;
    private final PageApi.Format format;
    private String content;
    private io.edition.content.ContentProfile contentProfile;
    private int revision;
    private PageApi.Status status;
    private PageApi.Seo seo;
    private String icon;
    private final Map<String, String> properties;
    private final List<PageApi.Attachment> attachments;
    private Instant trashedAt;
    private final Instant createdAt;
    private final PageApi.Actor createdBy;
    private Instant updatedAt;
    private PageApi.Actor updatedBy;

    public Page(
            UUID id,
            PageTitle title,
            PageApi.Format format,
            String content,
            int revision,
            PageApi.Status status,
            PageApi.Seo seo,
            String icon,
            Map<String, String> properties,
            List<PageApi.Attachment> attachments,
            Instant trashedAt,
            Instant createdAt,
            PageApi.Actor createdBy,
            Instant updatedAt,
            PageApi.Actor updatedBy) {
        this.id = Objects.requireNonNull(id, "page id");
        this.title = Objects.requireNonNull(title, "page title");
        this.format = Objects.requireNonNull(format, "page format");
        this.contentProfile = io.edition.content.ContentProfile.defaults(format.name());
        this.content = requireContent(content);
        if (revision < 0) throw new IllegalArgumentException("revision must not be negative");
        this.revision = revision;
        this.status = Objects.requireNonNull(status, "page status");
        this.seo = Objects.requireNonNull(seo, "page seo");
        this.icon = icon;
        this.properties = new LinkedHashMap<>(Objects.requireNonNull(properties, "page properties"));
        this.attachments = new ArrayList<>(Objects.requireNonNull(attachments, "page attachments"));
        this.trashedAt = trashedAt;
        this.createdAt = Objects.requireNonNull(createdAt, "created at");
        this.createdBy = Objects.requireNonNull(createdBy, "created by");
        this.updatedAt = Objects.requireNonNull(updatedAt, "updated at");
        this.updatedBy = Objects.requireNonNull(updatedBy, "updated by");
    }

    public static Page initial(
            UUID id,
            PageTitle title,
            PageApi.Format format,
            PageApi.InitialContent initial,
            PageApi.Actor actor,
            Instant now) {
        var page = new Page(
                id,
                title,
                format,
                "",
                0,
                PageApi.Status.DRAFT,
                PageApi.Seo.empty(),
                null,
                Map.of(),
                List.of(),
                null,
                now,
                actor,
                now,
                actor);
        page.edit(initial.content(), 0, actor);
        if (initial.contentProfile() != null) page.contentProfile = initial.contentProfile();
        var seo = Objects.requireNonNull(initial.seo(), "initial seo");
        page.setSeo(
                new PageApi.SeoPatch(
                        patch(seo.title()),
                        patch(seo.description()),
                        patch(seo.keywords()),
                        patch(seo.ogImage()),
                        Optional.of(seo.noIndex())),
                actor);
        page.replaceProperties(initial.properties(), actor);
        return page;
    }

    private static PageApi.Patch<String> patch(String value) {
        return value == null ? PageApi.Patch.clear() : PageApi.Patch.set(value);
    }

    public int edit(String nextContent, int baseRevision, PageApi.Actor actor) {
        return edit(nextContent, baseRevision, actor, contentProfile);
    }

    public int edit(
            String nextContent, int baseRevision, PageApi.Actor actor, io.edition.content.ContentProfile profile) {
        Objects.requireNonNull(actor, "actor");
        if (baseRevision != revision) throw new EditConflict(content, revision);
        content = requireContent(nextContent);
        if (profile != null) contentProfile = profile;
        revision++;
        updatedBy = actor;
        return revision;
    }

    public void rename(PageTitle nextTitle, PageApi.Actor actor) {
        title = Objects.requireNonNull(nextTitle, "page title");
        updatedBy = Objects.requireNonNull(actor, "actor");
    }

    public void setSeo(PageApi.SeoPatch patch, PageApi.Actor actor) {
        Objects.requireNonNull(patch, "seo patch");
        if (patch.isEmpty()) throw new InvalidField("seo", "empty_patch");
        String nextTitle = apply(
                seo.title(), patch.title(), value -> PageMetadata.text("title", value, PageMetadata.SEO_TITLE_MAX));
        String nextDescription = apply(
                seo.description(),
                patch.description(),
                value -> PageMetadata.text("description", value, PageMetadata.SEO_DESCRIPTION_MAX));
        String nextKeywords = apply(
                seo.keywords(),
                patch.keywords(),
                value -> PageMetadata.text("keywords", value, PageMetadata.SEO_KEYWORDS_MAX));
        String nextOgImage = apply(seo.ogImage(), patch.ogImage(), value -> PageMetadata.imageUrl("ogImage", value));
        boolean nextNoIndex = patch.noIndex().orElse(seo.noIndex());
        seo = new PageApi.Seo(nextTitle, nextDescription, nextKeywords, nextOgImage, nextNoIndex);
        updatedBy = Objects.requireNonNull(actor, "actor");
    }

    public void setIcon(String nextIcon, PageApi.Actor actor) {
        icon = PageMetadata.imageUrl("icon", nextIcon);
        updatedBy = Objects.requireNonNull(actor, "actor");
    }

    public void setProperty(String field, String value, PageApi.Actor actor) {
        String key = PageMetadata.propertyKey(field);
        String stored = PageMetadata.propertyValue(value);
        if (!properties.containsKey(key) && properties.size() >= PageApi.MAX_PROPERTIES) {
            throw new InvalidField("field", "too_many");
        }
        properties.put(key, stored);
        updatedBy = Objects.requireNonNull(actor, "actor");
    }

    public void replaceProperties(Map<String, String> values, PageApi.Actor actor) {
        Objects.requireNonNull(values, "properties");
        Objects.requireNonNull(actor, "actor");
        if (values.size() > PageApi.MAX_PROPERTIES) throw new InvalidField("field", "too_many");
        Map<String, String> next = new LinkedHashMap<>();
        for (var entry : values.entrySet()) {
            String key = PageMetadata.propertyKey(entry.getKey());
            String value = PageMetadata.propertyValue(entry.getValue());
            if (next.putIfAbsent(key, value) != null) throw new InvalidField("field", "duplicate");
        }
        properties.clear();
        properties.putAll(next);
        updatedBy = actor;
    }

    /** 不存在的键幂等：不抛错、不改 updatedBy。 */
    public boolean removeProperty(String field, PageApi.Actor actor) {
        String key = PageMetadata.propertyKey(field);
        if (properties.remove(key) == null) return false;
        updatedBy = Objects.requireNonNull(actor, "actor");
        return true;
    }

    /** 校验并登记引用；storageKey 由内容 sha256 决定，二进制落对象存储由组合层完成。 */
    public PageApi.Attachment attach(PageApi.FileUpload upload, PageApi.Actor actor, Instant now) {
        Objects.requireNonNull(actor, "actor");
        AttachmentFile file = AttachmentFile.inspect(upload);
        if (attachments.size() >= PageApi.MAX_ATTACHMENTS) throw new TooManyAttachments();
        var attachment = new PageApi.Attachment(
                UUID.randomUUID(),
                file.filename(),
                file.mime(),
                file.sizeBytes(),
                file.storageKey(),
                // PostgreSQL 时间戳只保留微秒；首次响应与数据库回读使用相同精度。
                now.truncatedTo(java.time.temporal.ChronoUnit.MICROS));
        attachments.add(attachment);
        updatedBy = actor;
        return attachment;
    }

    /** 只解除引用；不存在视为已解除（幂等）。 */
    public Optional<PageApi.Attachment> detach(UUID ref, PageApi.Actor actor) {
        Objects.requireNonNull(ref, "attachment ref");
        var removed =
                attachments.stream().filter(item -> item.ref().equals(ref)).findFirst();
        removed.ifPresent(item -> {
            attachments.remove(item);
            updatedBy = Objects.requireNonNull(actor, "actor");
        });
        return removed;
    }

    public Optional<PageApi.Attachment> attachment(UUID ref) {
        return attachments.stream().filter(item -> item.ref().equals(ref)).findFirst();
    }

    /** 已 published 为 no-op，不递增 revision。 */
    public boolean publish(PageApi.Actor actor) {
        Objects.requireNonNull(actor, "actor");
        if (status == PageApi.Status.PUBLISHED) return false;
        status = PageApi.Status.PUBLISHED;
        updatedBy = actor;
        return true;
    }

    /** 已 draft 为 no-op，不递增 revision。 */
    public boolean unpublish(PageApi.Actor actor) {
        Objects.requireNonNull(actor, "actor");
        if (status == PageApi.Status.DRAFT) return false;
        status = PageApi.Status.DRAFT;
        updatedBy = actor;
        return true;
    }

    /** 已回收为 no-op，不重置 trashedAt。 */
    public boolean trash(Instant now, PageApi.Actor actor) {
        Objects.requireNonNull(now, "trashed at");
        Objects.requireNonNull(actor, "actor");
        if (trashedAt != null) return false;
        trashedAt = now;
        updatedBy = actor;
        return true;
    }

    /** 未回收为 no-op。 */
    public boolean restore(PageApi.Actor actor) {
        Objects.requireNonNull(actor, "actor");
        if (trashedAt == null) return false;
        trashedAt = null;
        updatedBy = actor;
        return true;
    }

    public void persistedAt(Instant value) {
        updatedAt = Objects.requireNonNull(value, "updated at");
    }

    public Page withContentProfile(io.edition.content.ContentProfile profile) {
        if (profile != null) contentProfile = profile;
        return this;
    }

    public PageApi.View view() {
        return new PageApi.View(
                id,
                title.value(),
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
                contentProfile);
    }

    public UUID id() {
        return id;
    }

    public String title() {
        return title.value();
    }

    public String content() {
        return content;
    }

    public int revision() {
        return revision;
    }

    public PageApi.Status status() {
        return status;
    }

    public PageApi.Seo seo() {
        return seo;
    }

    public String icon() {
        return icon;
    }

    public Map<String, String> properties() {
        return Map.copyOf(properties);
    }

    public List<PageApi.Attachment> attachments() {
        return List.copyOf(attachments);
    }

    public Instant trashedAt() {
        return trashedAt;
    }

    public String actorType() {
        return updatedBy.type().name().toLowerCase(Locale.ROOT);
    }

    public UUID actorId() {
        return updatedBy.id();
    }

    private static <T> T apply(T current, PageApi.Patch<T> patch, java.util.function.UnaryOperator<T> normalize) {
        return switch (patch) {
            case PageApi.Patch.Unchanged<T> ignored -> current;
            case PageApi.Patch.Clear<T> ignored -> null;
            case PageApi.Patch.Set<T> set -> normalize.apply(set.value());
        };
    }

    private static String requireContent(String value) {
        Objects.requireNonNull(value, "page content");
        if (value.getBytes(StandardCharsets.UTF_8).length > MAX_CONTENT_BYTES) throw new ContentTooLarge();
        return value;
    }

    public static final class EditConflict extends RuntimeException {
        private final String theirs;
        private final int currentRevision;

        public EditConflict(String theirs, int currentRevision) {
            this.theirs = theirs;
            this.currentRevision = currentRevision;
        }

        public String theirs() {
            return theirs;
        }

        public int currentRevision() {
            return currentRevision;
        }
    }

    public static final class ContentTooLarge extends RuntimeException {}

    public static final class TooManyAttachments extends RuntimeException {}

    /** 元数据字段违反：field + 稳定 code，供 application 翻译为 Invalid 输出。 */
    public static final class InvalidField extends RuntimeException {
        private final String field;
        private final String code;

        public InvalidField(String field, String code) {
            this.field = field;
            this.code = code;
        }

        public String field() {
            return field;
        }

        public String code() {
            return code;
        }
    }
}
