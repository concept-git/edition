package io.space.concepts.release.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/** Release 概念唯一出口。调用方负责建立 tenant scope；每页 pageId 由调用方传入。 */
public interface ReleaseApi {
    int MAX_CONTENT_BYTES = 2 * 1024 * 1024;
    int MIN_KEEP = 1;
    int MAX_KEEP = 50;
    int DEFAULT_KEEP = 7;
    int MAX_TOC_DEPTH = 7;
    int MAX_LABEL_CODE_POINTS = 32;
    String BUNDLE_VERSION = "1.0";
    String GENERATOR = "space/1.0";

    static String checksum(String body) {
        return ContentHash.checksum(body);
    }

    static String contentFingerprint(String body) {
        return ContentHash.hex(body);
    }

    static String contentPath(PageSnapshot page) {
        if (page.contentPath() != null && !page.contentPath().isBlank()) return page.contentPath();
        return page.slug();
    }

    List<Issue> inspectContent(String format, String content, io.space.content.ContentProfile profile);

    View draft(ScopeId scope, Source source);

    LoadResult load(ReleaseId rel, Bundle bundle);

    default ValidateResult validate(ReleaseId rel, List<CoverageWarning> coverageWarnings) {
        return validate(rel, coverageWarnings, List.of());
    }

    /**
     * 与两参 {@code validate} 同一动作。组合层把同页 format 变更并入阻断报告；
     * {@code extraBlocking} 为空时效果与两参形式相同。
     */
    ValidateResult validate(ReleaseId rel, List<CoverageWarning> coverageWarnings, List<Issue> extraBlocking);

    MutationResult approve(ReleaseId rel);

    MutationResult promote(ReleaseId rel);

    MutationResult discard(ReleaseId rel);

    Set<ReleaseId> prune(ScopeId scope);

    Optional<Bundle> export(ReleaseId rel);

    boolean pin(ReleaseId rel, UUID reservation, Instant until);

    MutationResult setRetention(ScopeId scope, int keep);

    MutationResult setLabel(ReleaseId rel, String label);

    MutationResult annotate(ReleaseId rel, String notes);

    Optional<View> live(ScopeId scope);

    Optional<PageSnapshot> pageOf(ReleaseId rel, UUID page);

    List<PageHeader> pagesOf(ReleaseId rel);

    List<TocNode> tocOf(ReleaseId rel);

    Optional<ScopeId> scopeOf(ReleaseId rel);

    Optional<Status> status(ReleaseId rel);

    Optional<Delta> diff(ReleaseId left, ReleaseId right);

    List<View> list(ScopeId scope);
    /** 多范围键集分页（createdAt desc, id desc）；scopes 为空返回空页；非法 cursor 抛 IllegalArgumentException。 */
    Page page(Set<ScopeId> scopes, Optional<Status> status, String cursor, int limit);

    Optional<View> lastOf(ScopeId scope, SourceKind kind);

    int keep(ScopeId scope);

    record ReleaseId(UUID value) {
        public ReleaseId {
            Objects.requireNonNull(value, "release id");
        }
    }

    record ScopeId(UUID value) {
        public ScopeId {
            Objects.requireNonNull(value, "scope id");
        }
    }

    enum Status {
        DRAFT,
        FLAGGED,
        VALIDATED,
        LIVE,
        ARCHIVED
    }

    enum SourceKind {
        IMPORT,
        BUILD
    }

    enum Format {
        MARKDOWN,
        HTML,
        TXT,
        JSON,
        XML
    }

    enum TocKind {
        TARGET,
        GROUP,
        LINK
    }

    record Source(SourceKind kind, String ref, UUID actor) {
        public Source {
            Objects.requireNonNull(kind, "source kind");
        }
    }

    record Seo(String title, String description, String keywords, String ogImage, boolean noIndex) {
        public static Seo empty() {
            return new Seo(null, null, null, null, false);
        }
    }

    record AttachmentRef(String path, String storageKey, String sha256) {
        public AttachmentRef {
            Objects.requireNonNull(path, "attachment path");
            Objects.requireNonNull(storageKey, "storage key");
            Objects.requireNonNull(sha256, "sha256");
        }
    }

    List<Issue> inspectContent(
            String format,
            String content,
            io.space.content.ContentProfile profile,
            io.space.content.ContentTypeDefinition definition);

    List<Issue> inspectDefinition(io.space.content.ContentTypeDefinition definition);

    record PageSnapshot(
            UUID pageId,
            String slug,
            String title,
            Format format,
            String content,
            String contentPath,
            Seo seo,
            String icon,
            Map<String, String> properties,
            String externalId,
            List<AttachmentRef> attachments,
            int seq,
            io.space.content.ContentProfile contentProfile,
            io.space.content.ContentTypeSnapshot contentTypeDefinition) {
        public PageSnapshot(
                UUID pageId,
                String slug,
                String title,
                Format format,
                String content,
                String contentPath,
                Seo seo,
                String icon,
                Map<String, String> properties,
                String externalId,
                List<AttachmentRef> attachments,
                int seq,
                io.space.content.ContentProfile contentProfile) {
            this(
                    pageId,
                    slug,
                    title,
                    format,
                    content,
                    contentPath,
                    seo,
                    icon,
                    properties,
                    externalId,
                    attachments,
                    seq,
                    contentProfile,
                    null);
        }

        public PageSnapshot(
                UUID pageId,
                String slug,
                String title,
                Format format,
                String content,
                String contentPath,
                Seo seo,
                String icon,
                Map<String, String> properties,
                String externalId,
                List<AttachmentRef> attachments,
                int seq) {
            this(
                    pageId,
                    slug,
                    title,
                    format,
                    content,
                    contentPath,
                    seo,
                    icon,
                    properties,
                    externalId,
                    attachments,
                    seq,
                    io.space.content.ContentProfile.defaults(format.name()));
        }

        public PageSnapshot {
            contentProfile =
                    contentProfile == null ? io.space.content.ContentProfile.defaults(format.name()) : contentProfile;
            Objects.requireNonNull(pageId, "page id");
            Objects.requireNonNull(slug, "slug");
            Objects.requireNonNull(title, "title");
            Objects.requireNonNull(format, "format");
            content = content == null ? "" : content;
            seo = seo == null ? Seo.empty() : seo;
            properties = properties == null ? Map.of() : Map.copyOf(properties);
            attachments = attachments == null ? List.of() : List.copyOf(attachments);
        }
    }

    record PageHeader(UUID pageId, String slug, String title, Seo seo, int seq) {
        public PageHeader {
            Objects.requireNonNull(pageId, "page id");
            Objects.requireNonNull(slug, "slug");
            Objects.requireNonNull(title, "title");
            seo = seo == null ? Seo.empty() : seo;
        }
    }

    record TocNode(String label, TocKind kind, String ref, String url, List<TocNode> children) {
        public TocNode {
            Objects.requireNonNull(label, "toc label");
            Objects.requireNonNull(kind, "toc kind");
            children = children == null ? List.of() : List.copyOf(children);
        }
    }

    record Bundle(
            String bundleVersion,
            String generator,
            Instant generatedAt,
            List<PageSnapshot> pages,
            List<TocNode> toc,
            Map<String, String> checksums) {
        public Bundle {
            pages = pages == null ? List.of() : List.copyOf(pages);
            toc = toc == null ? List.of() : List.copyOf(toc);
            checksums = checksums == null ? Map.of() : Map.copyOf(checksums);
        }
    }

    record Issue(String code, String path, UUID pageId, String detail) {
        public Issue {
            Objects.requireNonNull(code, "issue code");
        }
    }

    record Report(List<Issue> errors, List<Issue> warnings, List<Issue> info) {
        public Report {
            errors = errors == null ? List.of() : List.copyOf(errors);
            warnings = warnings == null ? List.of() : List.copyOf(warnings);
            info = info == null ? List.of() : List.copyOf(info);
        }

        public static Report empty() {
            return new Report(List.of(), List.of(), List.of());
        }

        public boolean blocking() {
            return !errors.isEmpty();
        }
    }

    record CoverageWarning(UUID pageId, String externalId) {
        public CoverageWarning {
            Objects.requireNonNull(pageId, "page id");
        }
    }

    record View(
            UUID id,
            UUID scopeId,
            Status status,
            String label,
            String notes,
            Source source,
            int pageCount,
            Report report,
            Instant createdAt,
            Instant promotedAt) {}

    record Page(List<View> items, String nextCursor) {
        public Page {
            items = List.copyOf(items);
        }
    }

    record Delta(Set<UUID> added, Set<UUID> changed, Set<UUID> removed) {
        public Delta {
            added = Set.copyOf(added);
            changed = Set.copyOf(changed);
            removed = Set.copyOf(removed);
        }

        public boolean empty() {
            return added.isEmpty() && changed.isEmpty() && removed.isEmpty();
        }
    }

    sealed interface LoadResult {
        record Loaded(View release) implements LoadResult {}

        record InvalidBundle(View release, Report report) implements LoadResult {}

        record NotFound() implements LoadResult {}
    }

    sealed interface ValidateResult {
        record Ok(View release) implements ValidateResult {}

        record Warnings(View release, Report report) implements ValidateResult {}

        record Errors(View release, Report report) implements ValidateResult {}

        record NotFound() implements ValidateResult {}
    }

    sealed interface MutationResult {
        record Changed(View release) implements MutationResult {}

        record NotFound() implements MutationResult {}
    }

    void terminateScope(ScopeId scope);

    boolean referencesPage(UUID pageId);

    boolean referencesObject(String key);

    Set<String> objectKeys(ScopeId scope);

    Usage usage(ScopeId scope);

    record Usage(long releases, long snapshotPages, long textBytes) {}
}
