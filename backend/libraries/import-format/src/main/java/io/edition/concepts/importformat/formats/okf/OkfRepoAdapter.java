package io.edition.concepts.importformat.formats.okf;

import io.edition.concepts.importformat.api.*;
import io.edition.concepts.importformat.archive.PackFiles;
import io.edition.concepts.importformat.archive.PackIo;
import io.edition.concepts.importformat.archive.PackLookup;
import io.edition.concepts.importformat.archive.PackPaths;
import io.edition.concepts.importformat.attachments.AttachmentCollector;
import io.edition.concepts.importformat.contract.AdaptSink;
import io.edition.concepts.importformat.contract.AdaptedPack;
import io.edition.concepts.importformat.contract.ImportFormatAdapter;
import io.edition.concepts.importformat.contract.ImportLimits;
import io.edition.concepts.importformat.contract.PackIndex;
import io.edition.concepts.importformat.contract.PackSource;
import io.edition.concepts.importformat.directory.DirectoryToc;
import io.edition.concepts.importformat.markdown.FrontMatter;
import io.edition.concepts.importformat.markdown.MarkdownReferences;
import io.edition.shared.Sha256;
import java.io.IOException;
import java.io.InputStream;
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
import org.springframework.stereotype.Component;

@Component
public final class OkfRepoAdapter implements ImportFormatAdapter {
    public static final String ID = "okf-v0.1";
    private static final Pattern MARKDOWN_H1 = Pattern.compile("(?m)^#\\s+(.+?)\\s*#*\\s*$");

    @Override
    public String id() {
        return ID;
    }

    @Override
    public boolean metadataEntry(String name) {
        return PackPaths.basename(name).equals(".okfignore");
    }

    @Override
    public int order() {
        return 20;
    }

    @Override
    public boolean sniff(PackIndex index) {
        return PackFiles.hasBasename(index, ".okfignore") || PackFiles.hasBasename(index, "index.md");
    }

    @Override
    public boolean sniff(PackIndex index, PackSource source) {
        if (PackFiles.hasBasename(index, ".okfignore")) return true;
        for (String name : index.names()) {
            if (PackPaths.discarded(name) || PackPaths.directory(name)) continue;
            if (!PackPaths.basename(name).equals("index.md")) continue;
            try (InputStream in = source.open(name)) {
                String peek = new String(in.readNBytes(ImportLimits.SNIFF_PEEK_BYTES), StandardCharsets.UTF_8);
                if (peek.contains("okf_version")) return true;
            } catch (IOException ignored) {
                // try the next index.md
            }
        }
        return false;
    }

    @Override
    public Outcome adapt(PackSource source, AdaptSink sink) {
        PackLookup lookup = new PackLookup(source.index());
        AttachmentCollector attachments = new AttachmentCollector(source, sink);
        List<Doc> docs = new ArrayList<>();
        Set<String> consumed = new LinkedHashSet<>();
        for (String name : source.index().names()) {
            if (PackPaths.discarded(name) || PackPaths.directory(name) || PackPaths.zipSlip(name)) continue;
            if (!PackFiles.markdown(name)) continue;
            consumed.add(name);
            String text;
            try {
                text = PackIo.utf8Limited(source, name, ImportLimits.MAX_CONTENT_BYTES);
            } catch (IOException io) {
                return new Outcome.Invalid(List.of(new AdaptedPack.Issue("unreadable_entry", name, io.getMessage())));
            }
            if (text == null) {
                return new Outcome.Invalid(List.of(new AdaptedPack.Issue("content_too_large", name, null)));
            }
            FrontMatter.Parsed parsed = FrontMatter.parse(text);
            docs.add(new Doc(name, parsed, text));
        }
        Map<String, String> slugByPath = new LinkedHashMap<>();
        Map<String, String> groupLabels = new LinkedHashMap<>();
        Map<String, Doc> typed = new LinkedHashMap<>();
        List<DirectoryToc.Page> placed = new ArrayList<>();
        for (Doc doc : docs) {
            Object type = doc.parsed.data().get("type");
            if (type != null && !String.valueOf(type).isBlank()) {
                String slug = new io.edition.content.ResourcePath(PackPaths.unix(doc.zipName)).value();
                slugByPath.put(PackPaths.unix(doc.zipName), slug);
                slugByPath.put(externalId(doc.zipName), slug);
                slugByPath.put(PackPaths.stripExtension(doc.zipName), slug);
                typed.put(externalId(doc.zipName), doc);
                placed.add(new DirectoryToc.Page(
                        PackPaths.parent(doc.zipName),
                        externalId(doc.zipName),
                        titleOf(doc),
                        PackPaths.basename(doc.zipName)));
            } else if (PackPaths.basename(doc.zipName).equals("index.md")) {
                // OKF v0.2 的 index.md 无 frontmatter，分组名取首个 H1；都没有时 DirectoryToc 退回目录名
                groupLabels.put(PackPaths.parent(doc.zipName), headingOf(doc));
            } else {
                sink.info("skipped_file", doc.zipName, "markdown without type");
            }
        }
        List<AdaptedPack.Page> pages = new ArrayList<>();
        int seq = 0;
        for (DirectoryToc.Page position : DirectoryToc.depthFirst(placed, groupLabels)) {
            Doc doc = typed.get(position.externalId());
            List<String> pageAttachments = new ArrayList<>();
            String body = doc.original;
            MarkdownReferences.collectReferences(
                    body, doc.zipName, lookup, attachments, slugByPath.keySet(), pageAttachments);
            if (attachments.fatal() != null) return new Outcome.Invalid(List.of(attachments.fatal()));
            if (pageAttachments.size() > ImportLimits.MAX_ATTACHMENTS_PER_PAGE) {
                return new Outcome.Invalid(List.of(new AdaptedPack.Issue(
                        "too_many_attachments", doc.zipName, Integer.toString(pageAttachments.size()))));
            }
            String externalId = externalId(doc.zipName);
            String contentPath = "content/" + externalId + ".md";
            attachments.recordChecksum(contentPath, Sha256.hex(body.getBytes(StandardCharsets.UTF_8)));
            Map<String, String> properties = new LinkedHashMap<>();
            properties.put("okf_type", String.valueOf(doc.parsed.data().get("type")));
            String tags = tagsString(doc.parsed.data().get("tags"));
            if (tags != null) properties.put("okf_tags", tags);
            pages.add(new AdaptedPack.Page(
                    externalId,
                    slugByPath.get(PackPaths.unix(doc.zipName)),
                    titleOf(doc),
                    "markdown",
                    body,
                    new AdaptedPack.Seo(null, stringOf(doc.parsed.data().get("description")), null, null, false),
                    properties,
                    pageAttachments,
                    seq));
            seq++;
        }
        attachments.scanLeftovers(consumed);
        if (attachments.fatal() != null) return new Outcome.Invalid(List.of(attachments.fatal()));
        List<AdaptedPack.TocNode> toc = DirectoryToc.build(placed, groupLabels);
        return new Outcome.Adapted(new AdaptedPack(ID, pages, toc, attachments.checksums(), sink.issues()));
    }

    private static String externalId(String zipName) {
        String unix = PackPaths.unix(zipName);
        if (unix.toLowerCase(Locale.ROOT).endsWith(".md")) return unix.substring(0, unix.length() - 3);
        if (unix.toLowerCase(Locale.ROOT).endsWith(".markdown")) return unix.substring(0, unix.length() - 9);
        return unix;
    }

    private static String titleOf(Doc doc) {
        String title = headingOf(doc);
        return title == null ? PackPaths.stripExtension(doc.zipName) : title;
    }

    /** frontmatter title → 正文首个 `# ` 标题；没有则 null。 */
    private static String headingOf(Doc doc) {
        String title = stringOf(doc.parsed.data().get("title"));
        if (title != null) return title;
        Matcher heading = MARKDOWN_H1.matcher(doc.parsed.body());
        return heading.find() ? stringOf(heading.group(1)) : null;
    }

    private static String stringOf(Object value) {
        if (value == null) return null;
        String text = String.valueOf(value).strip();
        return text.isEmpty() ? null : text;
    }

    private static String tagsString(Object value) {
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

    private record Doc(String zipName, FrontMatter.Parsed parsed, String original) {}
}
