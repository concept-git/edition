package io.space.concepts.release.adapters.persistence;

import io.space.concepts.release.api.*;
import io.space.concepts.release.api.ContentHash;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.release.domain.Release;
import io.space.concepts.release.domain.ReleaseRepository;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

@Repository
class MyBatisReleaseRepository implements ReleaseRepository {
    private static final TypeReference<Map<String, String>> STRING_MAP = new TypeReference<>() {};
    private static final TypeReference<List<ReleaseApi.AttachmentRef>> ATTACHMENTS = new TypeReference<>() {};
    private static final TypeReference<List<ReleaseApi.TocNode>> TOC = new TypeReference<>() {};
    private static final TypeReference<ReleaseApi.Report> REPORT = new TypeReference<>() {};
    private static final TypeReference<ReleaseApi.Seo> SEO = new TypeReference<>() {};

    private final ReleaseMapper mapper;
    private final JsonMapper json;

    MyBatisReleaseRepository(ReleaseMapper mapper, JsonMapper json) {
        this.mapper = mapper;
        this.json = json;
    }

    @Override
    public void pin(ReleaseApi.ReleaseId id, UUID reservation, java.time.Instant until) {
        mapper.pin(id.value(), reservation, until);
    }

    @Override
    public Release insert(UUID scopeId, ReleaseApi.Source source, String label) {
        return release(mapper.insert(scopeId, label, stored(source.kind()), source.ref(), source.actor()), false);
    }

    @Override
    public Optional<Release> find(ReleaseApi.ReleaseId id) {
        return Optional.ofNullable(mapper.find(id.value())).map(this::release);
    }

    @Override
    public Optional<Release> lock(ReleaseApi.ReleaseId id) {
        return Optional.ofNullable(mapper.lock(id.value())).map(this::release);
    }

    @Override
    public Optional<Release> lockLive(ReleaseApi.ScopeId scope) {
        return Optional.ofNullable(mapper.lockLive(scope.value())).map(this::release);
    }

    @Override
    public Release save(Release release) {
        return release(
                mapper.save(
                        release.id(),
                        stored(release.status()),
                        release.label(),
                        release.notes(),
                        release.pageCount(),
                        write(release.report()),
                        release.promotedAt()),
                release.loaded());
    }

    @Override
    public void insertSnapshot(ReleaseApi.ReleaseId id, ReleaseApi.Bundle bundle) {
        // Bound each statement even for the 500 MiB capacity target; both writes share the caller transaction.
        for (int offset = 0; offset < bundle.pages().size(); offset += 64) {
            var rows = bundle
                    .pages()
                    .subList(offset, Math.min(offset + 64, bundle.pages().size()))
                    .stream()
                    .map(page -> new ReleaseMapper.SnapshotRow(
                            page.pageId().toString(),
                            page.slug(),
                            page.title(),
                            stored(page.format()),
                            write(page.seo()),
                            page.icon(),
                            write(page.properties()),
                            page.externalId(),
                            write(page.attachments()),
                            ContentHash.hex(page.content()),
                            page.content(),
                            page.seq(),
                            write(page.contentProfile()),
                            page.contentTypeDefinition() == null ? null : write(page.contentTypeDefinition())))
                    .toList();
            mapper.insertContents(rows);
            mapper.insertPages(id.value(), rows);
        }
        mapper.insertToc(id.value(), write(bundle.toc()));
        String generator =
                bundle.generator() == null || bundle.generator().isBlank() ? ReleaseApi.GENERATOR : bundle.generator();
        String version =
                bundle.bundleVersion() == null || bundle.bundleVersion().isBlank()
                        ? ReleaseApi.BUNDLE_VERSION
                        : bundle.bundleVersion();
        mapper.saveBundleMeta(id.value(), version, generator, bundle.generatedAt());
    }

    @Override
    public boolean hasSnapshot(ReleaseApi.ReleaseId id) {
        return mapper.hasSnapshot(id.value());
    }

    @Override
    public Optional<ReleaseApi.Bundle> snapshot(ReleaseApi.ReleaseId id) {
        if (!mapper.hasSnapshot(id.value())) return Optional.empty();
        List<ReleaseApi.PageSnapshot> pages =
                mapper.pages(id.value()).stream().map(this::page).toList();
        List<ReleaseApi.TocNode> toc = read(mapper.toc(id.value()), TOC);
        Map<String, String> checksums = new LinkedHashMap<>();
        for (var page : pages) {
            checksums.put(contentPath(page), ContentHash.checksum(page.content()));
            for (var attachment : page.attachments()) {
                checksums.put(attachment.path(), "sha256:" + ContentHash.stripPrefix(attachment.sha256()));
            }
        }
        ReleaseMapper.ReleaseRow meta = mapper.find(id.value());
        String generator =
                meta == null || meta.generator() == null || meta.generator().isBlank()
                        ? ReleaseApi.GENERATOR
                        : meta.generator();
        String version = meta == null
                        || meta.bundleVersion() == null
                        || meta.bundleVersion().isBlank()
                ? ReleaseApi.BUNDLE_VERSION
                : meta.bundleVersion();
        Instant generatedAt = meta == null ? null : meta.generatedAt();
        return Optional.of(new ReleaseApi.Bundle(version, generator, generatedAt, pages, toc, checksums));
    }

    @Override
    public Optional<ReleaseApi.PageSnapshot> page(ReleaseApi.ReleaseId id, UUID pageId) {
        return Optional.ofNullable(mapper.page(id.value(), pageId)).map(this::page);
    }

    @Override
    public List<ReleaseApi.PageHeader> pageHeaders(ReleaseApi.ReleaseId id) {
        return mapper.pageHeaders(id.value()).stream()
                .map(row -> new ReleaseApi.PageHeader(
                        UUID.fromString(row.pageId()),
                        row.slug(),
                        row.title(),
                        row.seo() == null ? ReleaseApi.Seo.empty() : read(row.seo(), SEO),
                        row.seq()))
                .toList();
    }

    @Override
    public List<ReleaseApi.TocNode> toc(ReleaseApi.ReleaseId id) {
        String stored = mapper.toc(id.value());
        return stored == null ? List.of() : read(stored, TOC);
    }

    @Override
    public void delete(ReleaseApi.ReleaseId id) {
        mapper.delete(id.value());
    }

    @Override
    public Optional<Release> live(ReleaseApi.ScopeId scope) {
        return Optional.ofNullable(mapper.live(scope.value())).map(this::release);
    }

    @Override
    public List<Release> list(ReleaseApi.ScopeId scope) {
        return mapper.list(scope.value()).stream().map(this::release).toList();
    }

    @Override
    public List<Release> page(
            java.util.Set<ReleaseApi.ScopeId> scopes,
            ReleaseApi.Status status,
            Instant beforeCreatedAt,
            UUID beforeId,
            int limit) {
        if (scopes.isEmpty()) return List.of();
        List<String> ids = scopes.stream()
                .map(ReleaseApi.ScopeId::value)
                .sorted()
                .map(UUID::toString)
                .toList();
        return mapper.pageScopes(ids, status == null ? null : stored(status), beforeCreatedAt, beforeId, limit).stream()
                .map(row -> release(row.row(), row.loaded()))
                .toList();
    }

    @Override
    public Optional<Release> lastOf(ReleaseApi.ScopeId scope, ReleaseApi.SourceKind kind) {
        return Optional.ofNullable(mapper.lastOf(scope.value(), stored(kind))).map(this::release);
    }

    @Override
    public int count(ReleaseApi.ScopeId scope) {
        return mapper.count(scope.value());
    }

    @Override
    public int keep(ReleaseApi.ScopeId scope) {
        Integer keep = mapper.keep(scope.value());
        return keep == null ? ReleaseApi.DEFAULT_KEEP : keep;
    }

    @Override
    public void setKeep(ReleaseApi.ScopeId scope, int keep) {
        mapper.setKeep(scope.value(), keep);
    }

    @Override
    public void lockRetention(ReleaseApi.ScopeId scope) {
        mapper.ensureRetention(scope.value(), ReleaseApi.DEFAULT_KEEP);
        mapper.lockKeep(scope.value());
    }

    @Override
    public List<ReleaseApi.ReleaseId> archivedBeyondKeep(ReleaseApi.ScopeId scope, int keep) {
        return mapper.archivedBeyondKeep(scope.value(), keep).stream()
                .map(id -> new ReleaseApi.ReleaseId(UUID.fromString(id)))
                .toList();
    }

    @Override
    public int recycleOrphanContents() {
        return mapper.recycleOrphanContents();
    }

    @Override
    public List<PageFingerprint> fingerprints(ReleaseApi.ReleaseId id) {
        return mapper.fingerprints(id.value()).stream()
                .map(row -> new PageFingerprint(UUID.fromString(row.pageId()), row.contentHash()))
                .toList();
    }

    private Release release(ReleaseMapper.ReleaseRow row) {
        return release(row, mapper.hasSnapshot(UUID.fromString(row.id())));
    }

    private Release release(ReleaseMapper.ReleaseRow row, boolean loaded) {
        UUID actor = row.sourceActorId() == null ? null : UUID.fromString(row.sourceActorId());
        var source = new ReleaseApi.Source(
                ReleaseApi.SourceKind.valueOf(row.sourceKind().toUpperCase(Locale.ROOT)), row.sourceRef(), actor);
        return new Release(
                UUID.fromString(row.id()),
                UUID.fromString(row.spaceId()),
                ReleaseApi.Status.valueOf(row.status().toUpperCase(Locale.ROOT)),
                row.label(),
                row.notes(),
                source,
                row.pageCount() == null ? 0 : row.pageCount(),
                read(row.report(), REPORT),
                row.createdAt(),
                row.promotedAt(),
                loaded);
    }

    private ReleaseApi.PageSnapshot page(ReleaseMapper.PageRow row) {
        ReleaseApi.Format format = ReleaseApi.Format.valueOf(row.format().toUpperCase(Locale.ROOT));
        ReleaseApi.Seo seo = row.seo() == null ? ReleaseApi.Seo.empty() : read(row.seo(), SEO);
        Map<String, String> properties = row.properties() == null ? Map.of() : read(row.properties(), STRING_MAP);
        List<ReleaseApi.AttachmentRef> attachments =
                row.attachments() == null ? List.of() : read(row.attachments(), ATTACHMENTS);
        UUID pageId = UUID.fromString(row.pageId());
        String externalId = row.externalId();
        String path = row.slug();
        return new ReleaseApi.PageSnapshot(
                pageId,
                row.slug(),
                row.title(),
                format,
                row.body(),
                path,
                seo,
                row.icon(),
                properties,
                externalId,
                attachments,
                row.seq(),
                row.contentProfile() == null
                        ? io.space.content.ContentProfile.defaults(format.name())
                        : json.readValue(row.contentProfile(), io.space.content.ContentProfile.class),
                row.contentDefinition() == null
                        ? null
                        : json.readValue(row.contentDefinition(), io.space.content.ContentTypeSnapshot.class));
    }

    private static String contentPath(ReleaseApi.PageSnapshot page) {
        return ReleaseApi.contentPath(page);
    }

    private String write(Object value) {
        if (value == null) return null;
        try {
            return json.writeValueAsString(value);
        } catch (JacksonException impossible) {
            throw new IllegalStateException("release json is not serializable", impossible);
        }
    }

    private <T> T read(String value, TypeReference<T> type) {
        if (value == null || value.isBlank()) return null;
        try {
            return json.readValue(value, type);
        } catch (JacksonException corrupt) {
            throw new IllegalStateException("release json is corrupt", corrupt);
        }
    }

    private static String stored(Enum<?> value) {
        return value.name().toLowerCase(Locale.ROOT);
    }

    @Override
    public void terminateScope(ReleaseApi.ScopeId scope) {
        mapper.deleteScope(scope.value());
        mapper.deleteRetention(scope.value());
        mapper.recycleOrphanContents();
    }

    @Override
    public boolean referencesPage(UUID id) {
        return mapper.referencesPage(id);
    }

    @Override
    public boolean referencesObject(String key) {
        return mapper.referencesObject(key);
    }

    @Override
    public java.util.Set<String> objectKeys(ReleaseApi.ScopeId scope) {
        return mapper.objectKeys(scope.value());
    }

    @Override
    public ReleaseApi.Usage usage(ReleaseApi.ScopeId scope) {
        return mapper.usage(scope.value());
    }
}
