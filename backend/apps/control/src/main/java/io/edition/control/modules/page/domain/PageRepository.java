package io.edition.control.modules.page.domain;

import io.edition.control.modules.page.api.*;
import io.edition.control.modules.page.api.PageApi;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface PageRepository {
    Page insert(PageTitle title, PageApi.Format format, PageApi.Actor actor, io.edition.content.ContentProfile profile);

    Optional<Page> insert(PageTitle title, PageApi.Format format, PageApi.Actor actor, UUID id);

    Optional<Page> insert(Page initial);

    Optional<Page> find(PageApi.PageId id);

    Optional<Page> lock(PageApi.PageId id);
    /** 持久化页面自身列（标题/内容/基线/SEO/图标/属性/actor）；附件引用另走 add/removeAttachment。 */
    Page save(Page page);

    void addAttachment(UUID page, PageApi.Attachment attachment, PageApi.Actor actor);

    void removeAttachment(UUID page, UUID ref);

    List<Page> findAll(Set<PageApi.PageId> ids);

    List<Page> page(
            java.time.Instant beforeUpdatedAt,
            UUID beforeId,
            int limit,
            PageApi.Status status,
            PageApi.Format format,
            boolean includeTrashed);

    List<Page> trashed(java.time.Instant beforeTrashedAt, UUID beforeId, int limit);

    void delete(PageApi.PageId page);

    boolean referencesObject(String key);

    List<UUID> expired(java.time.Instant before, UUID after, int limit);

    List<AttachmentCandidate> attachmentCandidates(java.time.Instant before, UUID id, int limit, String q, String type);

    record AttachmentCandidate(PageApi.AttachmentEntry entry, boolean matches) {}

    PageApi.Usage usage(Set<UUID> ids);
}
