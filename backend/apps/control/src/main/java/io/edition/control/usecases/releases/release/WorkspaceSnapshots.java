package io.edition.control.usecases.releases.release;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.modules.toc.api.TocApi;
import java.time.Clock;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * 工作区 → Bundle：未回收 published 页 + 摘悬挂后的 Toc + 附件元数据。不读对象存储。
 */
@Component
public class WorkspaceSnapshots {
    private final SpaceApi spaces;
    private final PageApi pages;
    private final TocApi toc;
    private final Clock clock;
    private final io.edition.control.usecases.resource.ContentTypes contentTypes;

    WorkspaceSnapshots(
            SpaceApi spaces,
            PageApi pages,
            TocApi toc,
            Clock clock,
            io.edition.control.usecases.resource.ContentTypes contentTypes) {
        this.contentTypes = contentTypes;
        this.spaces = spaces;
        this.pages = pages;
        this.toc = toc;
        this.clock = clock;
    }

    public Snapshot collect(UUID space) {
        List<SpaceApi.Placement> placements = spaces.itemsOf(new SpaceApi.SpaceId(space));
        Map<UUID, String> slugs = placements.stream()
                .collect(Collectors.toUnmodifiableMap(SpaceApi.Placement::item, SpaceApi.Placement::slug));
        Set<PageApi.PageId> ids =
                slugs.keySet().stream().map(PageApi.PageId::new).collect(Collectors.toUnmodifiableSet());
        List<PageApi.View> published = pages.views(ids).stream()
                .filter(page -> page.status() == PageApi.Status.PUBLISHED && page.trashedAt() == null)
                .sorted(Comparator.comparing((PageApi.View page) ->
                                slugs.getOrDefault(page.id(), page.id().toString()))
                        .thenComparing(PageApi.View::id))
                .toList();
        Set<UUID> publishedIds = published.stream().map(PageApi.View::id).collect(Collectors.toUnmodifiableSet());
        List<ReleaseApi.PageSnapshot> snapshots = new ArrayList<>(published.size());
        Map<String, String> checksums = new LinkedHashMap<>();
        int seq = 0;
        for (PageApi.View page : published) {
            ReleaseApi.PageSnapshot snapshot = pageSnapshot(page, slugs.get(page.id()), seq++);
            snapshots.add(snapshot);
            checksums.put(ReleaseApi.contentPath(snapshot), ReleaseApi.checksum(snapshot.content()));
            for (var attachment : snapshot.attachments()) {
                checksums.put(
                        attachment.path(),
                        attachment.sha256().startsWith("sha256:")
                                ? attachment.sha256()
                                : "sha256:" + attachment.sha256());
            }
        }
        List<ReleaseApi.TocNode> tocTree = projectToc(toc.tree(new TocApi.TocId(space)), publishedIds);
        var bundle = new ReleaseApi.Bundle(
                ReleaseApi.BUNDLE_VERSION, ReleaseApi.GENERATOR, clock.instant(), snapshots, tocTree, checksums);
        return new Snapshot(bundle);
    }

    /** 摘掉 target 不在快照中的节点，子节点挂到被摘节点的父节点；不改工作区 Toc。 */
    public static List<ReleaseApi.TocNode> projectToc(List<TocApi.View> nodes, Set<UUID> publishedPages) {
        List<ReleaseApi.TocNode> result = new ArrayList<>();
        for (TocApi.View node : nodes) {
            List<ReleaseApi.TocNode> children = projectToc(node.children(), publishedPages);
            if (node.kind() == TocApi.Kind.TARGET
                    && (node.targetId() == null || !publishedPages.contains(node.targetId()))) {
                result.addAll(children);
                continue;
            }
            result.add(toNode(node, children));
        }
        return List.copyOf(result);
    }

    private ReleaseApi.PageSnapshot pageSnapshot(PageApi.View page, String slug, int seq) {
        String externalId = page.id().toString();
        String contentPath = slug;
        List<ReleaseApi.AttachmentRef> attachments = page.attachments().stream()
                .map(item -> new ReleaseApi.AttachmentRef(
                        "attachments/" + item.storageKey() + "/" + item.filename(),
                        item.storageKey(),
                        "sha256:" + item.storageKey()))
                .toList();
        PageApi.Seo seo = page.seo();
        return new ReleaseApi.PageSnapshot(
                page.id(),
                slug,
                page.title(),
                ReleaseApi.Format.valueOf(page.format().name()),
                page.content(),
                contentPath,
                new ReleaseApi.Seo(seo.title(), seo.description(), seo.keywords(), seo.ogImage(), seo.noIndex()),
                page.icon(),
                page.properties(),
                externalId,
                attachments,
                seq,
                page.contentProfile(),
                contentTypes.freeze(page.contentProfile()));
    }

    private static ReleaseApi.TocNode toNode(TocApi.View node, List<ReleaseApi.TocNode> children) {
        return switch (node.kind()) {
            case TARGET ->
                new ReleaseApi.TocNode(
                        node.label(), ReleaseApi.TocKind.TARGET, node.targetId().toString(), null, children);
            case LINK -> new ReleaseApi.TocNode(node.label(), ReleaseApi.TocKind.LINK, null, node.url(), children);
            case GROUP -> new ReleaseApi.TocNode(node.label(), ReleaseApi.TocKind.GROUP, null, null, children);
        };
    }

    public record Snapshot(ReleaseApi.Bundle bundle) {
        public int pageCount() {
            return bundle.pages().size();
        }
    }
}
