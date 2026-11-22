package io.edition.control.modules.importformat.formats.filetree;

import io.edition.content.DocumentFormat;
import io.edition.control.modules.importformat.api.*;
import io.edition.control.modules.importformat.archive.PackIo;
import io.edition.control.modules.importformat.archive.PackLookup;
import io.edition.control.modules.importformat.archive.PackPaths;
import io.edition.control.modules.importformat.attachments.AttachmentCollector;
import io.edition.control.modules.importformat.attachments.HtmlAttachments;
import io.edition.control.modules.importformat.contract.AdaptSink;
import io.edition.control.modules.importformat.contract.AdaptedPack;
import io.edition.control.modules.importformat.contract.ImportFormatAdapter;
import io.edition.control.modules.importformat.contract.ImportLimits;
import io.edition.control.modules.importformat.contract.PackIndex;
import io.edition.control.modules.importformat.contract.PackSource;
import io.edition.control.modules.importformat.directory.DirectoryToc;
import io.edition.control.modules.importformat.directory.SlugBook;
import io.edition.control.modules.importformat.markdown.FrontMatter;
import io.edition.control.modules.importformat.markdown.MarkdownReferences;
import io.edition.shared.Sha256;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

/**
 * 裸目录树（兜底格式，id {@code file-tree}）：目录即 Toc group，受支持的文本文件即页。
 * externalId = frontmatter {@code id}，否则去扩展名的相对路径；slug 保留原相对文件路径。
 */
@Component
public final class PlainTreeAdapter implements ImportFormatAdapter {
    public static final String ID = "file-tree";
    private static final Pattern MARKDOWN_H1 = Pattern.compile("(?m)^#\\s+(.+?)\\s*#*\\s*$");
    private static final Set<String> RESERVED_KEYS = Set.of("id", "title", "description");
    private static final String INDEX_FIRST = "\u0000";

    @Override
    public String id() {
        return ID;
    }

    @Override
    public int order() {
        return 30;
    }

    @Override
    public boolean sniff(PackIndex index) {
        return FileTreeSelection.anyPageCandidate(index);
    }

    @Override
    public Outcome adapt(PackSource source, AdaptSink sink) {
        List<String> candidates = new ArrayList<>();
        Set<String> consumed = new LinkedHashSet<>();
        for (String name : source.index().names()) {
            if (PackPaths.directory(name) || PackPaths.discarded(name) || PackPaths.zipSlip(name)) continue;
            if (source.metadataEntry(name)) continue;
            if (FileTreeSelection.repositoryBoilerplate(name)) {
                consumed.add(name);
                sink.info("skipped_file", name, "repository boilerplate");
                continue;
            }
            if (FileTreeSelection.pageCandidate(name)) candidates.add(name);
        }
        if (candidates.size() > ImportLimits.MAX_PAGE_FILES) {
            return new Outcome.Invalid(
                    List.of(new AdaptedPack.Issue("too_many_files", null, Integer.toString(candidates.size()))));
        }
        PackLookup lookup = new PackLookup(source.index());
        AttachmentCollector attachments = new AttachmentCollector(source, sink);
        Map<String, String> slugByPath = new LinkedHashMap<>();
        Map<String, String> groupLabels = new LinkedHashMap<>();
        Map<String, Doc> docsByExternalId = new LinkedHashMap<>();
        List<DirectoryToc.Page> placed = new ArrayList<>();
        for (String name : candidates) {
            consumed.add(name);
            Doc doc;
            try {
                doc = read(source, name, sink);
            } catch (IOException io) {
                return new Outcome.Invalid(List.of(new AdaptedPack.Issue("unreadable_entry", name, io.getMessage())));
            }
            if (doc == null)
                return new Outcome.Invalid(List.of(new AdaptedPack.Issue("content_too_large", name, null)));
            if (docsByExternalId.putIfAbsent(doc.externalId, doc) != null) {
                return new Outcome.Invalid(
                        List.of(new AdaptedPack.Issue("duplicate_external_id", name, doc.externalId)));
            }
            String slug;
            try {
                slug = new io.edition.content.ResourcePath(PackPaths.unix(name)).value();
            } catch (IllegalArgumentException invalid) {
                return new Outcome.Invalid(
                        List.of(new AdaptedPack.Issue("invalid_manifest", name, "invalid_resource_path")));
            }
            slugByPath.put(PackPaths.unix(name), slug);
            slugByPath.put(pathWithoutExtension(name), slug);
            slugByPath.put(doc.externalId, slug);
            String dir = PackPaths.parent(name);
            boolean index = SlugBook.isIndexName(PackPaths.stripExtension(name));
            if (index && !dir.isEmpty()) groupLabels.putIfAbsent(dir, doc.title);
            placed.add(new DirectoryToc.Page(
                    dir,
                    doc.externalId,
                    doc.title,
                    (index ? INDEX_FIRST : "") + PackPaths.basename(name).toLowerCase(Locale.ROOT)));
        }
        List<AdaptedPack.Page> pages = new ArrayList<>();
        int seq = 0;
        for (DirectoryToc.Page position : DirectoryToc.depthFirst(placed, groupLabels)) {
            Doc doc = docsByExternalId.get(position.externalId());
            List<String> pageAttachments = new ArrayList<>();
            String body = doc.body;
            if (doc.format.bodyKind() == DocumentFormat.BodyKind.MARKDOWN) {
                MarkdownReferences.collectReferences(
                        body, doc.zipName, lookup, attachments, slugByPath.keySet(), pageAttachments);
            }
            if (doc.format.bodyKind() == DocumentFormat.BodyKind.HTML)
                pageAttachments.addAll(HtmlAttachments.collect(
                        Jsoup.parse(doc.body),
                        doc.zipName,
                        lookup,
                        zip -> attachments.putZipEntryAs(zip, PackPaths.unix(zip))));
            if (attachments.fatal() != null) return new Outcome.Invalid(List.of(attachments.fatal()));
            if (pageAttachments.size() > ImportLimits.MAX_ATTACHMENTS_PER_PAGE) {
                return new Outcome.Invalid(List.of(new AdaptedPack.Issue(
                        "too_many_attachments", doc.zipName, Integer.toString(pageAttachments.size()))));
            }
            String contentPath = "content/" + pathWithoutExtension(doc.zipName) + "." + doc.format.extension();
            attachments.recordChecksum(contentPath, Sha256.hex(body.getBytes(StandardCharsets.UTF_8)));
            pages.add(new AdaptedPack.Page(
                    doc.externalId,
                    slugByPath.get(PackPaths.unix(doc.zipName)),
                    doc.title,
                    doc.format.wireName(),
                    body,
                    new AdaptedPack.Seo(null, doc.description, null, null, false),
                    doc.properties,
                    pageAttachments,
                    seq));
            seq++;
        }
        attachments.scanLeftovers(consumed);
        if (attachments.fatal() != null) return new Outcome.Invalid(List.of(attachments.fatal()));
        List<AdaptedPack.TocNode> toc = DirectoryToc.build(placed, groupLabels);
        if (docsByExternalId.values().stream().anyMatch(Doc::pathIdentity)) {
            sink.info(
                    "path_based_page_identity",
                    null,
                    "Some page identities use package paths. To keep identity when moving a page, set its existing externalId as the Markdown frontmatter id or in a Bundle v1 manifest.");
        }
        return new Outcome.Adapted(new AdaptedPack(ID, pages, toc, attachments.checksums(), sink.issues()));
    }

    /** 读一页：frontmatter（仅 markdown）、标题回退链、属性上限。超过正文上限返回 null。 */
    private static Doc read(PackSource source, String name, AdaptSink sink) throws IOException {
        String text = PackIo.utf8Limited(source, name, ImportLimits.MAX_CONTENT_BYTES);
        if (text == null) return null;
        DocumentFormat format = DocumentFormat.fromFileName(name).orElseThrow();
        Map<String, Object> data = Map.of();
        String body = text;
        String title = null;
        switch (format.bodyKind()) {
            case MARKDOWN -> {
                FrontMatter.Parsed parsed = FrontMatter.parse(text);
                data = parsed.data();
                title = stringOf(data.get("title"));
                if (title == null) title = markdownHeading(parsed.body());
            }
            case HTML -> {
                // Parse only for title metadata; preserve uploaded HTML verbatim.
                title = htmlTitle(Jsoup.parse(text));
            }
            case SOURCE -> {}
        }
        String id = stringOf(data.get("id"));
        String externalId = id != null ? id : pathWithoutExtension(name);
        if (title == null) title = filenameLabel(name);
        return new Doc(
                name,
                format,
                externalId,
                id == null,
                title,
                stringOf(data.get("description")),
                body,
                properties(data, name, sink));
    }

    private static Map<String, String> properties(Map<String, Object> data, String name, AdaptSink sink) {
        Map<String, String> properties = new LinkedHashMap<>();
        for (var entry : data.entrySet()) {
            if (RESERVED_KEYS.contains(entry.getKey())) continue;
            String value = scalar(entry.getValue());
            if (value == null) continue;
            if (properties.size() >= ImportLimits.MAX_PROPERTIES) {
                sink.info("property_dropped", name, entry.getKey() + ": too many properties");
                continue;
            }
            if (value.length() > ImportLimits.MAX_PROPERTY_VALUE_CHARS) {
                sink.info("property_dropped", name, entry.getKey() + ": value too long");
                continue;
            }
            properties.put(entry.getKey(), value);
        }
        return properties;
    }

    private static String scalar(Object value) {
        if (value == null) return null;
        if (value instanceof Collection<?> collection) {
            List<String> parts = new ArrayList<>();
            for (Object item : collection) {
                if (item != null && !String.valueOf(item).isBlank())
                    parts.add(String.valueOf(item).strip());
            }
            return parts.isEmpty() ? null : String.join(", ", parts);
        }
        return stringOf(value);
    }

    private static String markdownHeading(String body) {
        Matcher matcher = MARKDOWN_H1.matcher(body);
        return matcher.find() ? stringOf(matcher.group(1)) : null;
    }

    private static String htmlTitle(Document doc) {
        Element h1 = doc.selectFirst("h1");
        String heading = h1 == null ? null : stringOf(h1.text());
        return heading == null ? stringOf(doc.title()) : heading;
    }

    /** 文件名去序号、去扩展名、分隔符转空格；index/readme 用所在目录名。 */
    private static String filenameLabel(String name) {
        String stem = PackPaths.stripExtension(name);
        String dir = PackPaths.parent(name);
        if (SlugBook.isIndexName(stem) && !dir.isEmpty()) stem = PackPaths.basename(dir);
        String label = SlugBook.stripOrderPrefix(stem)
                .replace('-', ' ')
                .replace('_', ' ')
                .strip();
        return label.isEmpty() ? stem : label;
    }

    private static String pathWithoutExtension(String name) {
        String unix = PackPaths.unix(name);
        int slash = unix.lastIndexOf('/');
        int dot = unix.lastIndexOf('.');
        return dot > slash + 1 ? unix.substring(0, dot) : unix;
    }

    private static String stringOf(Object value) {
        if (value == null) return null;
        String text = String.valueOf(value).strip();
        return text.isEmpty() ? null : text;
    }

    private record Doc(
            String zipName,
            DocumentFormat format,
            String externalId,
            boolean pathIdentity,
            String title,
            String description,
            String body,
            Map<String, String> properties) {}
}
