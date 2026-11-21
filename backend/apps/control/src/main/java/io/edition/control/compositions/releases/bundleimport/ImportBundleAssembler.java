package io.edition.control.compositions.releases.bundleimport;

import io.edition.concepts.importformat.contract.AdaptedPack;
import io.edition.concepts.release.api.ReleaseApi;
import io.edition.content.DocumentFormat;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/** 适配包与稳定 pageId 组合为不可变发版快照；无 I/O 或状态变更。 */
final class ImportBundleAssembler {
    private ImportBundleAssembler() {}

    static ReleaseApi.Bundle assemble(AdaptedPack pack, ImportPageIds.Assignment assignment, Instant createdAt) {
        List<ReleaseApi.PageSnapshot> pages = new ArrayList<>(pack.pages().size());
        Map<String, String> checksums = new LinkedHashMap<>();
        for (AdaptedPack.Page page : pack.pages()) {
            UUID pageId = assignment.pageIds().get(page.externalId());
            DocumentFormat documentFormat =
                    DocumentFormat.fromWire(page.format()).orElseThrow();
            ReleaseApi.Format format = ReleaseApi.Format.valueOf(documentFormat.name());
            String contentPath = page.slug();
            List<ReleaseApi.AttachmentRef> attachments = new ArrayList<>();
            for (String path : page.attachments()) {
                String listedChecksum = pack.checksums().getOrDefault(path, "");
                String storageKey = listedChecksum.startsWith("sha256:")
                        ? listedChecksum.substring("sha256:".length())
                        : listedChecksum;
                String checksum = listedChecksum.startsWith("sha256:") ? listedChecksum : "sha256:" + listedChecksum;
                attachments.add(new ReleaseApi.AttachmentRef(path, storageKey, checksum));
                checksums.put(path, checksum);
            }
            AdaptedPack.Seo seo = page.seo() == null ? AdaptedPack.Seo.empty() : page.seo();
            String content = documentFormat.bodyKind() == DocumentFormat.BodyKind.MARKDOWN
                            && !pack.generator().equals("file-tree")
                    ? rewriteAttachmentHrefs(page.content(), page.attachments())
                    : page.content();
            pages.add(new ReleaseApi.PageSnapshot(
                    pageId,
                    page.slug(),
                    page.title(),
                    format,
                    content,
                    contentPath,
                    new ReleaseApi.Seo(seo.title(), seo.description(), seo.keywords(), seo.ogImage(), seo.noIndex()),
                    page.icon(),
                    page.properties(),
                    page.externalId(),
                    attachments,
                    page.seq(),
                    page.contentProfile(),
                    page.contentTypeDefinition()));
            checksums.put(contentPath, ReleaseApi.checksum(content));
        }
        List<ReleaseApi.TocNode> toc =
                pack.toc().stream().map(ImportBundleAssembler::toReleaseTocNode).toList();
        return new ReleaseApi.Bundle(ReleaseApi.BUNDLE_VERSION, pack.generator(), createdAt, pages, toc, checksums);
    }

    private static ReleaseApi.TocNode toReleaseTocNode(AdaptedPack.TocNode node) {
        ReleaseApi.TocKind kind =
                switch (node.kind().toLowerCase(Locale.ROOT)) {
                    case "group" -> ReleaseApi.TocKind.GROUP;
                    case "link" -> ReleaseApi.TocKind.LINK;
                    default -> ReleaseApi.TocKind.TARGET;
                };
        return new ReleaseApi.TocNode(
                node.label(),
                kind,
                node.ref(),
                node.url(),
                node.children().stream()
                        .map(ImportBundleAssembler::toReleaseTocNode)
                        .toList());
    }

    private static String rewriteAttachmentHrefs(String content, List<String> attachments) {
        String rewritten = content;
        for (String path : attachments) {
            int slash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
            String name = slash >= 0 ? path.substring(slash + 1) : path;
            rewritten = rewritten.replace("../" + path, path);
            rewritten = rewritten.replace("./" + path, path);
            rewritten = rewritten.replace("../attachments/" + name, path);
        }
        return rewritten;
    }
}
