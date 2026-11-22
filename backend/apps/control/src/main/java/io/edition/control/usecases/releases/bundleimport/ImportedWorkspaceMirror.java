package io.edition.control.usecases.releases.bundleimport;

import io.edition.control.modules.objectstore.api.ObjectStoreApi;
import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.revision.api.RevisionApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.modules.toc.api.TocApi;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** 导入 promote 后把 Bundle 镜像回工作区；author=system。 */
@Component
class ImportedWorkspaceMirror {
    private static final PageApi.Actor SYSTEM_PAGE = PageApi.Actor.system();
    private static final RevisionApi.Actor SYSTEM_REVISION = new RevisionApi.Actor(RevisionApi.ActorType.SYSTEM, null);

    private final PageApi pages;
    private final SpaceApi spaces;
    private final TocApi toc;
    private final RevisionApi revisions;
    private final ObjectStoreApi objectStore;

    ImportedWorkspaceMirror(
            PageApi pages, SpaceApi spaces, TocApi toc, RevisionApi revisions, ObjectStoreApi objectStore) {
        this.pages = pages;
        this.spaces = spaces;
        this.toc = toc;
        this.revisions = revisions;
        this.objectStore = objectStore;
    }

    void mirrorReleaseIntoWorkspace(UUID space, ReleaseApi.Bundle bundle, Set<UUID> trash) {
        SpaceApi.SpaceId spaceId = new SpaceApi.SpaceId(space);
        for (UUID id : trash) {
            reslug(spaceId, id, tempSlug("t", id));
            pages.trash(new PageApi.PageId(id), SYSTEM_PAGE);
        }
        List<ReleaseApi.PageSnapshot> existing = new ArrayList<>();
        List<ReleaseApi.PageSnapshot> created = new ArrayList<>();
        for (int offset = 0; offset < bundle.pages().size(); offset += 64) {
            var batch = bundle.pages()
                    .subList(offset, Math.min(offset + 64, bundle.pages().size()));
            Set<PageApi.PageId> ids = batch.stream()
                    .map(snapshot -> new PageApi.PageId(snapshot.pageId()))
                    .collect(Collectors.toSet());
            Map<UUID, PageApi.View> currentPages =
                    pages.views(ids).stream().collect(Collectors.toMap(PageApi.View::id, page -> page));
            for (ReleaseApi.PageSnapshot snapshot : batch) {
                PageApi.View current = currentPages.get(snapshot.pageId());
                if (current == null) {
                    created.add(snapshot);
                } else {
                    if (current.trashedAt() != null) pages.restore(new PageApi.PageId(snapshot.pageId()), SYSTEM_PAGE);
                    existing.add(snapshot);
                }
            }
        }
        for (ReleaseApi.PageSnapshot snapshot : existing) {
            reslug(spaceId, snapshot.pageId(), tempSlug("i", snapshot.pageId()));
        }
        for (ReleaseApi.PageSnapshot snapshot : existing) {
            reslug(spaceId, snapshot.pageId(), snapshot.slug());
            syncExisting(snapshot);
        }
        for (ReleaseApi.PageSnapshot snapshot : created) {
            createPlaced(spaceId, snapshot);
        }
        replaceToc(space, bundle);
    }

    private void syncExisting(ReleaseApi.PageSnapshot snapshot) {
        PageApi.PageId id = new PageApi.PageId(snapshot.pageId());
        PageApi.View current = pages.view(id).orElseThrow(() -> new IllegalStateException("imported page missing"));
        if (!Objects.equals(current.content(), snapshot.content())
                || !Objects.equals(current.contentProfile(), snapshot.contentProfile())) {
            PageApi.View edited =
                    switch (pages.edit(
                            id, snapshot.content(), current.revision(), SYSTEM_PAGE, snapshot.contentProfile())) {
                        case PageApi.EditResult.Edited value -> value.page();
                        case PageApi.EditResult.Conflict ignored ->
                            throw new IllegalStateException("import edit conflicted");
                        case PageApi.EditResult.NotFound ignored ->
                            throw new IllegalStateException("import page missing");
                        case PageApi.EditResult.ContentTooLarge ignored ->
                            throw new IllegalStateException("import content too large");
                    };
            revisions.record(
                    new RevisionApi.ItemId(snapshot.pageId()),
                    edited.revision(),
                    edited.content(),
                    SYSTEM_REVISION,
                    null,
                    edited.contentProfile());
            current = edited;
        }
        if (!current.title().equals(snapshot.title())) {
            switch (pages.rename(id, snapshot.title(), SYSTEM_PAGE)) {
                case PageApi.MutationResult.Changed ignored -> {}
                case PageApi.MutationResult.NotFound ignored -> throw new IllegalStateException("rename missing page");
                case PageApi.MutationResult.InvalidTitle ignored ->
                    throw new IllegalStateException("import title invalid");
            }
        }
        applyIcon(id, current.icon(), snapshot.icon());
        applySeo(id, current.seo(), snapshot.seo());
        applyProperties(id, current, snapshot.properties());
        applyAttachments(id, current, snapshot);
        if (current.status() != PageApi.Status.PUBLISHED) pages.publish(id, SYSTEM_PAGE);
    }

    private void createPlaced(SpaceApi.SpaceId spaceId, ReleaseApi.PageSnapshot snapshot) {
        PageApi.Format format = PageApi.Format.valueOf(snapshot.format().name());
        ReleaseApi.Seo seo = snapshot.seo() == null ? ReleaseApi.Seo.empty() : snapshot.seo();
        var initial = new PageApi.InitialContent(
                snapshot.content(),
                new PageApi.Seo(seo.title(), seo.description(), seo.keywords(), seo.ogImage(), seo.noIndex()),
                snapshot.properties() == null ? Map.of() : snapshot.properties(),
                snapshot.contentProfile());
        PageApi.View created =
                switch (pages.create(
                        SYSTEM_PAGE, format, snapshot.title(), new PageApi.PageId(snapshot.pageId()), initial)) {
                    case PageApi.CreateContentResult.Created value -> value.page();
                    case PageApi.CreateContentResult.ContentTooLarge ignored ->
                        throw new IllegalStateException("import content too large");
                    case PageApi.CreateContentResult.Invalid invalid ->
                        throw new IllegalStateException("import metadata invalid " + invalid.field());
                    case PageApi.CreateContentResult.InvalidTitle ignored ->
                        throw new IllegalStateException("import title invalid");
                    case PageApi.CreateContentResult.IdTaken ignored ->
                        throw new IllegalStateException("import page id taken");
                };
        switch (spaces.place(spaceId, created.id(), snapshot.slug())) {
            case SpaceApi.PlacementResult.Placed ignored -> {}
            case SpaceApi.PlacementResult.SlugTaken ignored -> throw new IllegalStateException("import slug taken");
            case SpaceApi.PlacementResult.SlugInvalid ignored -> throw new IllegalStateException("import slug invalid");
            case SpaceApi.PlacementResult.SpaceArchived ignored ->
                throw new IllegalStateException("import space archived");
            case SpaceApi.PlacementResult.SpaceNotFound ignored ->
                throw new IllegalStateException("import space missing");
            case SpaceApi.PlacementResult.ItemAlreadyPlaced ignored -> {}
            case SpaceApi.PlacementResult.ItemNotInSpace ignored ->
                throw new IllegalStateException("import place rejected");
        }
        revisions.record(
                new RevisionApi.ItemId(created.id()),
                created.revision(),
                created.content(),
                SYSTEM_REVISION,
                null,
                created.contentProfile());
        applyIcon(new PageApi.PageId(created.id()), created.icon(), snapshot.icon());
        applyAttachments(new PageApi.PageId(created.id()), created, snapshot);
        pages.publish(new PageApi.PageId(created.id()), SYSTEM_PAGE);
    }

    private void applyIcon(PageApi.PageId id, String current, String next) {
        if (Objects.equals(current, next)) return;
        switch (pages.setIcon(id, next, SYSTEM_PAGE)) {
            case PageApi.MetadataResult.Changed ignored -> {}
            case PageApi.MetadataResult.NotFound ignored -> throw new IllegalStateException("icon page missing");
            case PageApi.MetadataResult.Invalid invalid ->
                throw new IllegalStateException("import icon invalid " + invalid.field());
        }
    }

    private void applySeo(PageApi.PageId id, PageApi.Seo current, ReleaseApi.Seo seo) {
        if (seo == null
                || current.equals(
                        new PageApi.Seo(seo.title(), seo.description(), seo.keywords(), seo.ogImage(), seo.noIndex())))
            return;
        var patch = new PageApi.SeoPatch(
                text(seo.title()),
                text(seo.description()),
                text(seo.keywords()),
                text(seo.ogImage()),
                Optional.of(seo.noIndex()));
        if (patch.isEmpty()) return;
        switch (pages.setSeo(id, patch, SYSTEM_PAGE)) {
            case PageApi.MetadataResult.Changed ignored -> {}
            case PageApi.MetadataResult.NotFound ignored -> throw new IllegalStateException("seo page missing");
            case PageApi.MetadataResult.Invalid invalid ->
                throw new IllegalStateException("import seo invalid " + invalid.field());
        }
    }

    private void applyProperties(PageApi.PageId id, PageApi.View current, Map<String, String> wanted) {
        Map<String, String> next = wanted == null ? Map.of() : wanted;
        if (current.properties().equals(next)) return;
        switch (pages.replaceProperties(id, next, SYSTEM_PAGE)) {
            case PageApi.MetadataResult.Changed ignored -> {}
            case PageApi.MetadataResult.NotFound ignored -> throw new IllegalStateException("property page missing");
            case PageApi.MetadataResult.Invalid invalid ->
                throw new IllegalStateException("import property invalid " + invalid.field());
        }
    }

    private void applyAttachments(PageApi.PageId id, PageApi.View current, ReleaseApi.PageSnapshot snapshot) {
        Map<AttachmentKey, ArrayDeque<PageApi.Attachment>> unmatched = new HashMap<>();
        for (PageApi.Attachment attachment : current.attachments()) {
            var key = new AttachmentKey(attachment.filename(), attachment.storageKey());
            unmatched.computeIfAbsent(key, ignored -> new ArrayDeque<>()).addLast(attachment);
        }
        List<ReleaseApi.AttachmentRef> added = new ArrayList<>();
        for (ReleaseApi.AttachmentRef ref : snapshot.attachments()) {
            var key = new AttachmentKey(filename(ref.path()).strip(), ref.storageKey());
            var candidates = unmatched.get(key);
            if (candidates == null || candidates.pollFirst() == null) added.add(ref);
        }
        for (var candidates : unmatched.values()) {
            for (var attachment : candidates) {
                pages.detach(id, attachment.ref(), SYSTEM_PAGE);
            }
        }
        for (ReleaseApi.AttachmentRef ref : added) {
            byte[] bytes = read(ref.storageKey());
            switch (pages.attach(id, new PageApi.FileUpload(filename(ref.path()), bytes), SYSTEM_PAGE)) {
                case PageApi.AttachResult.Attached ignored -> {}
                case PageApi.AttachResult.NotFound ignored -> throw new IllegalStateException("attach page missing");
                case PageApi.AttachResult.FileTooLarge ignored ->
                    throw new IllegalStateException("import attachment too large");
                case PageApi.AttachResult.FileTypeUnsupported ignored ->
                    throw new IllegalStateException("import attachment type");
                case PageApi.AttachResult.TooManyAttachments ignored ->
                    throw new IllegalStateException("import too many attachments");
                case PageApi.AttachResult.Invalid invalid ->
                    throw new IllegalStateException("import attachment invalid " + invalid.field());
            }
        }
    }

    private record AttachmentKey(String filename, String storageKey) {}

    private void replaceToc(UUID space, ReleaseApi.Bundle bundle) {
        Map<String, UUID> extToId = new HashMap<>();
        for (ReleaseApi.PageSnapshot page : bundle.pages()) {
            if (page.externalId() != null) extToId.put(page.externalId(), page.pageId());
        }
        List<TocApi.Draft> tree =
                bundle.toc().stream().map(node -> tocDraft(node, extToId)).toList();
        switch (toc.replace(new TocApi.TocId(space), tree)) {
            case TocApi.ReplaceResult.Replaced ignored -> {}
            case TocApi.ReplaceResult.DepthExceeded ignored -> throw new IllegalStateException("import toc too deep");
            case TocApi.ReplaceResult.Invalid invalid ->
                throw new IllegalStateException("import toc invalid " + invalid.field());
        }
    }

    private static TocApi.Draft tocDraft(ReleaseApi.TocNode node, Map<String, UUID> extToId) {
        List<TocApi.Draft> children =
                node.children().stream().map(child -> tocDraft(child, extToId)).toList();
        return switch (node.kind()) {
            case TARGET -> new TocApi.Draft(node.label(), TocApi.Kind.TARGET, extToId.get(node.ref()), null, children);
            case GROUP -> new TocApi.Draft(node.label(), TocApi.Kind.GROUP, null, null, children);
            case LINK -> new TocApi.Draft(node.label(), TocApi.Kind.LINK, null, node.url(), children);
        };
    }

    private void reslug(SpaceApi.SpaceId space, UUID item, String slug) {
        switch (spaces.reslug(space, item, slug)) {
            case SpaceApi.PlacementResult.Placed ignored -> {}
            case SpaceApi.PlacementResult.ItemAlreadyPlaced ignored -> {}
            case SpaceApi.PlacementResult.SlugTaken ignored -> throw new IllegalStateException("import reslug taken");
            case SpaceApi.PlacementResult.SlugInvalid ignored ->
                throw new IllegalStateException("import reslug invalid");
            case SpaceApi.PlacementResult.ItemNotInSpace ignored -> {}
            case SpaceApi.PlacementResult.SpaceArchived ignored ->
                throw new IllegalStateException("import space archived");
            case SpaceApi.PlacementResult.SpaceNotFound ignored ->
                throw new IllegalStateException("import space missing");
        }
    }

    private byte[] read(String storageKey) {
        Optional<InputStream> opened = objectStore.open(storageKey);
        if (opened.isEmpty()) {
            throw new ObjectStoreApi.Unavailable("import attachment missing: " + storageKey, null);
        }
        try (InputStream in = opened.orElseThrow()) {
            byte[] bytes = in.readNBytes((int) PageApi.MAX_ATTACHMENT_BYTES + 1);
            if (bytes.length > PageApi.MAX_ATTACHMENT_BYTES) {
                throw new IllegalStateException("import attachment exceeds 10MiB");
            }
            return bytes;
        } catch (IOException failure) {
            throw new UncheckedIOException(failure);
        }
    }

    private static PageApi.Patch<String> text(String value) {
        return value == null ? PageApi.Patch.clear() : PageApi.Patch.set(value);
    }

    private static String filename(String path) {
        int slash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        return slash >= 0 ? path.substring(slash + 1) : path;
    }

    private static String tempSlug(String prefix, UUID id) {
        return prefix + id.toString().replace("-", "").toLowerCase(Locale.ROOT);
    }
}
