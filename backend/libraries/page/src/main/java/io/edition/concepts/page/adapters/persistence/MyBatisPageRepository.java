package io.edition.concepts.page.adapters.persistence;

import io.edition.concepts.page.api.*;
import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.page.domain.Page;
import io.edition.concepts.page.domain.PageRepository;
import io.edition.concepts.page.domain.PageTitle;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

@Repository
class MyBatisPageRepository implements PageRepository {
    private static final TypeReference<LinkedHashMap<String, String>> PROPERTIES = new TypeReference<>() {};
    private final PageMapper mapper;
    private final AttachmentMapper attachments;
    private final JsonMapper json;

    MyBatisPageRepository(PageMapper mapper, AttachmentMapper attachments, JsonMapper json) {
        this.mapper = mapper;
        this.attachments = attachments;
        this.json = json;
    }

    @Override
    public Page insert(
            PageTitle title, PageApi.Format format, PageApi.Actor actor, io.edition.content.ContentProfile profile) {
        var initialProfile = profile == null ? io.edition.content.ContentProfile.defaults(format.name()) : profile;
        return page(
                mapper.insert(
                        title.value(),
                        stored(format),
                        stored(actor.type()),
                        actor.id(),
                        json.writeValueAsString(initialProfile)),
                List.of());
    }

    @Override
    public Optional<Page> insert(PageTitle title, PageApi.Format format, PageApi.Actor actor, UUID id) {
        return Optional.ofNullable(
                        mapper.insertWithId(id, title.value(), stored(format), stored(actor.type()), actor.id()))
                .map(row -> page(row, List.of()));
    }

    @Override
    public Optional<Page> insert(Page initial) {
        var view = initial.view();
        return Optional.ofNullable(mapper.insertInitial(
                        view,
                        stored(view.format()),
                        stored(view.createdBy().type()),
                        writeProperties(view.properties()),
                        json.writeValueAsString(view.contentProfile())))
                .map(row -> page(row, List.of()));
    }

    @Override
    public Optional<Page> find(PageApi.PageId id) {
        return Optional.ofNullable(mapper.find(id.value())).map(this::withAttachments);
    }

    @Override
    public Optional<Page> lock(PageApi.PageId id) {
        return Optional.ofNullable(mapper.lock(id.value())).map(this::withAttachments);
    }

    @Override
    public Page save(Page value) {
        PageApi.Seo seo = value.seo();
        return page(
                mapper.save(
                        value.id(),
                        value.title(),
                        value.content(),
                        json.writeValueAsString(value.view().contentProfile()),
                        value.revision(),
                        stored(value.status()),
                        seo.title(),
                        seo.description(),
                        seo.keywords(),
                        seo.ogImage(),
                        seo.noIndex(),
                        value.icon(),
                        writeProperties(value.properties()),
                        value.trashedAt(),
                        value.actorType(),
                        value.actorId()),
                value.attachments());
    }

    @Override
    public void addAttachment(UUID page, PageApi.Attachment attachment, PageApi.Actor actor) {
        attachments.insert(
                attachment.ref(),
                page,
                attachment.filename(),
                attachment.mime(),
                attachment.sizeBytes(),
                attachment.storageKey(),
                attachment.createdAt(),
                actor.id());
    }

    @Override
    public void removeAttachment(UUID page, UUID ref) {
        attachments.delete(page, ref);
    }

    @Override
    public List<Page> findAll(Set<PageApi.PageId> ids) {
        if (ids.isEmpty()) return List.of();
        Set<String> values =
                ids.stream().map(PageApi.PageId::value).map(UUID::toString).collect(Collectors.toUnmodifiableSet());
        return withAttachments(mapper.findAll(values));
    }

    @Override
    public List<Page> page(
            Instant beforeUpdatedAt,
            UUID beforeId,
            int limit,
            PageApi.Status status,
            PageApi.Format format,
            boolean includeTrashed) {
        return withAttachments(mapper.page(
                beforeUpdatedAt,
                beforeId,
                limit,
                status == null ? null : stored(status),
                format == null ? null : stored(format),
                includeTrashed));
    }

    @Override
    public List<Page> trashed(Instant beforeTrashedAt, UUID beforeId, int limit) {
        return withAttachments(mapper.trashed(beforeTrashedAt, beforeId, limit));
    }

    private Page withAttachments(PageMapper.PageRow row) {
        return page(
                row,
                attachments.findByPage(UUID.fromString(row.id())).stream()
                        .map(MyBatisPageRepository::attachment)
                        .toList());
    }

    private List<Page> withAttachments(List<PageMapper.PageRow> rows) {
        if (rows.isEmpty()) return List.of();
        Set<String> ids = rows.stream().map(PageMapper.PageRow::id).collect(Collectors.toUnmodifiableSet());
        Map<String, List<PageApi.Attachment>> byPage = attachments.findByPages(ids).stream()
                .collect(Collectors.groupingBy(
                        AttachmentMapper.AttachmentRow::pageId,
                        Collectors.mapping(MyBatisPageRepository::attachment, Collectors.toList())));
        return rows.stream()
                .map(row -> page(row, byPage.getOrDefault(row.id(), List.of())))
                .toList();
    }

    private Page page(PageMapper.PageRow row, List<PageApi.Attachment> pageAttachments) {
        return new Page(
                        UUID.fromString(row.id()),
                        new PageTitle(row.title()),
                        PageApi.Format.valueOf(row.format().toUpperCase(Locale.ROOT)),
                        row.content(),
                        row.revision(),
                        PageApi.Status.valueOf(row.status().toUpperCase(Locale.ROOT)),
                        new PageApi.Seo(
                                row.seoTitle(),
                                row.seoDescription(),
                                row.seoKeywords(),
                                row.ogImageUrl(),
                                row.noIndex()),
                        row.icon(),
                        readProperties(row.properties()),
                        pageAttachments,
                        row.trashedAt(),
                        row.createdAt(),
                        actor(row.createdByType(), row.createdBy()),
                        row.updatedAt(),
                        actor(row.updatedByType(), row.updatedBy()))
                .withContentProfile(
                        row.contentProfile() == null
                                ? null
                                : json.readValue(row.contentProfile(), io.edition.content.ContentProfile.class));
    }

    private static PageApi.Attachment attachment(AttachmentMapper.AttachmentRow row) {
        return new PageApi.Attachment(
                UUID.fromString(row.id()),
                row.filename(),
                row.mime(),
                row.sizeBytes(),
                row.storageKey(),
                row.createdAt());
    }

    private Map<String, String> readProperties(String value) {
        if (value == null || value.isBlank()) return Map.of();
        try {
            return json.readValue(value, PROPERTIES);
        } catch (JacksonException corrupt) {
            throw new IllegalStateException("authoring.pages.properties is not a string map", corrupt);
        }
    }

    private String writeProperties(Map<String, String> value) {
        try {
            return json.writeValueAsString(value);
        } catch (JacksonException impossible) {
            throw new IllegalStateException("page properties are not serializable", impossible);
        }
    }

    private static PageApi.Actor actor(String type, String id) {
        return new PageApi.Actor(
                PageApi.ActorType.valueOf(type.toUpperCase(Locale.ROOT)), id == null ? null : UUID.fromString(id));
    }

    private static String stored(Enum<?> value) {
        return value.name().toLowerCase(Locale.ROOT);
    }

    @Override
    public void delete(PageApi.PageId page) {
        attachments.deleteAll(page.value());
        mapper.delete(page.value());
    }

    @Override
    public boolean referencesObject(String key) {
        return attachments.referencesObject(key);
    }

    @Override
    public List<UUID> expired(Instant before, UUID after, int limit) {
        return mapper.expired(before, after, limit).stream()
                .map(UUID::fromString)
                .toList();
    }

    @Override
    public List<AttachmentCandidate> attachmentCandidates(Instant before, UUID id, int limit, String q, String type) {
        return attachments.candidates(before, id, limit, q, type).stream()
                .map(row -> new AttachmentCandidate(
                        new PageApi.AttachmentEntry(
                                UUID.fromString(row.id()),
                                UUID.fromString(row.pageId()),
                                row.pageTitle(),
                                row.filename(),
                                row.mime(),
                                row.sizeBytes(),
                                row.createdAt()),
                        row.matches()))
                .toList();
    }

    @Override
    public PageApi.Usage usage(Set<UUID> ids) {
        return ids.isEmpty()
                ? new PageApi.Usage(0, 0, 0, 0, 0, 0, 0)
                : mapper.usage(ids.stream().map(UUID::toString).collect(Collectors.toSet()));
    }
}
