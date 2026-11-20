package io.space.contentapp.compositions.machine;

import com.vladsch.flexmark.html2md.converter.FlexmarkHtmlConverter;
import com.vladsch.flexmark.html2md.converter.LinkConversion;
import com.vladsch.flexmark.util.data.MutableDataSet;
import io.space.content.DocumentFormat;
import io.space.delivery.contract.SiteSnapshot;
import io.space.contentapp.compositions.page.ContentPageRenderer;
import io.space.contentapp.compositions.shared.ContentProblem;
import io.space.contentapp.entry.persistence.PublicationPages.PageAccess;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;

/** 机器阅读是交付视图：索引匿名且精选，正文沿用页面访问判定。 */
@Service
public final class MachineReading {
    private static final int MAX_PAGE_BYTES = 64 * 1024 * 1024;
    private final ContentPageRenderer renderer;
    private final FlexmarkHtmlConverter converter = FlexmarkHtmlConverter.builder(new MutableDataSet()
                    .set(FlexmarkHtmlConverter.SETEXT_HEADINGS, false)
                    .set(FlexmarkHtmlConverter.OUTPUT_ATTRIBUTES_ID, false)
                    .set(FlexmarkHtmlConverter.UNORDERED_LIST_DELIMITER, '-')
                    .set(FlexmarkHtmlConverter.EXT_INLINE_LINK, LinkConversion.MARKDOWN_EXPLICIT)
                    .set(FlexmarkHtmlConverter.EXT_INLINE_IMAGE, LinkConversion.MARKDOWN_EXPLICIT))
            .build();

    public MachineReading(ContentPageRenderer renderer) {
        this.renderer = renderer;
    }

    public String siteIndex(
            SiteSnapshot.Brand brand, List<SiteSnapshot.Space> spaces, List<PageAccess> index, String origin) {
        indexingAllowed(brand);
        var pages = pages(index);
        StringBuilder body =
                new StringBuilder("# ").append(label(brand.siteName())).append("\n\n");
        boolean hasSpaces = false;
        for (var space : spaces) {
            if (!hasTarget(space.navigation(), pages)) continue;
            if (!hasSpaces)
                body.append("## ")
                        .append(chinese(brand) ? "文档空间" : "Documentation spaces")
                        .append("\n\n");
            hasSpaces = true;
            body.append("- [")
                    .append(label(space.name()))
                    .append("](")
                    .append(origin)
                    .append('/')
                    .append(segment(space.slug()))
                    .append("/llms.txt)\n");
        }
        if (!hasSpaces) throw new ContentProblem(404, "machine_index_not_found");
        return body.toString();
    }

    public String spaceIndex(
            SiteSnapshot.Brand brand, SiteSnapshot.Space space, List<PageAccess> index, String origin) {
        indexingAllowed(brand);
        var pages = pages(index);
        var sections = new LinkedHashMap<String, List<IndexEntry>>();
        collect(space.navigation(), pages, new HashSet<>(), null, List.of(), sections, chinese(brand) ? "页面" : "Pages");
        if (sections.isEmpty()) throw new ContentProblem(404, "machine_index_not_found");
        StringBuilder body = new StringBuilder("# ").append(label(space.name())).append("\n\n");
        for (var section : sections.entrySet()) {
            body.append("## ").append(label(section.getKey())).append("\n\n");
            for (var entry : section.getValue()) {
                body.append("- [")
                        .append(label(entry.label()))
                        .append("](")
                        .append(origin)
                        .append(segments(entry.path()))
                        .append("?view=markdown)");
                if (entry.description() != null && !entry.description().isBlank())
                    body.append(": ").append(label(entry.description()));
                body.append('\n');
            }
            body.append('\n');
        }
        return body.toString();
    }

    public String markdown(SiteSnapshot.Page page, String path) {
        if (page.contentBytes() != null && page.contentBytes() > MAX_PAGE_BYTES)
            throw new ContentProblem(413, "content_too_large");
        if (page.content().getBytes(StandardCharsets.UTF_8).length > MAX_PAGE_BYTES)
            throw new ContentProblem(413, "content_too_large");
        DocumentFormat format = DocumentFormat.fromStored(page.format());
        String markdown =
                switch (format.bodyKind()) {
                    case SOURCE -> fencedSource(format, page.content());
                    case MARKDOWN, HTML -> convertedMarkdown(page, path);
                };
        if (markdown.isBlank() && !page.content().isBlank()) throw ContentProblem.unavailable();
        String result = "# " + label(page.title()) + "\n\n" + (markdown.isBlank() ? "" : markdown + "\n");
        if (result.getBytes(StandardCharsets.UTF_8).length > MAX_PAGE_BYTES)
            throw new ContentProblem(413, "content_too_large");
        return result;
    }

    private String convertedMarkdown(SiteSnapshot.Page page, String path) {
        try {
            return converter.convert(renderer.render(page, path).html()).strip();
        } catch (IllegalArgumentException | IllegalStateException invalid) {
            throw ContentProblem.unavailable();
        }
    }

    private static String fencedSource(DocumentFormat format, String source) {
        int longest = 2;
        int run = 0;
        for (int i = 0; i < source.length(); i++) {
            run = source.charAt(i) == '`' ? run + 1 : 0;
            longest = Math.max(longest, run);
        }
        String fence = "`".repeat(longest + 1);
        return fence + format.wireName() + "\n" + source + (source.endsWith("\n") ? "" : "\n") + fence;
    }

    private static void indexingAllowed(SiteSnapshot.Brand brand) {
        if ("noindex".equals(brand.robotsPolicy())) throw new ContentProblem(404, "machine_index_not_found");
    }

    private static Map<UUID, PageAccess> pages(List<PageAccess> index) {
        var result = new HashMap<UUID, PageAccess>();
        for (var page : index) result.put(page.id(), page);
        return result;
    }

    private static boolean hasTarget(List<SiteSnapshot.Node> nodes, Map<UUID, PageAccess> pages) {
        for (var node : nodes) {
            if (node.pageId() != null) {
                var page = pages.get(node.pageId());
                if (page != null && !page.noIndex()) return true;
            }
            if (hasTarget(node.children(), pages)) return true;
        }
        return false;
    }

    private void collect(
            List<SiteSnapshot.Node> nodes,
            Map<UUID, PageAccess> pages,
            Set<UUID> seen,
            String section,
            List<String> ancestors,
            Map<String, List<IndexEntry>> sections,
            String defaultSection) {
        for (var node : nodes) {
            if (node.pageId() != null) {
                var row = pages.get(node.pageId());
                if (row != null && !row.noIndex() && seen.add(node.pageId())) {
                    String prefix = ancestors.isEmpty() ? "" : String.join(" / ", ancestors) + " / ";
                    sections.computeIfAbsent(section == null ? defaultSection : section, ignored -> new ArrayList<>())
                            .add(new IndexEntry(prefix + node.label(), row.path(), row.description()));
                }
            }
            if (node.kind().equals("group")) {
                if (section == null)
                    collect(node.children(), pages, seen, node.label(), List.of(), sections, defaultSection);
                else {
                    var next = new ArrayList<>(ancestors);
                    next.add(node.label());
                    collect(node.children(), pages, seen, section, next, sections, defaultSection);
                }
            } else {
                collect(node.children(), pages, seen, section, ancestors, sections, defaultSection);
            }
        }
    }

    private static boolean chinese(SiteSnapshot.Brand brand) {
        return brand.locale() != null && brand.locale().startsWith("zh");
    }

    private static String segment(String value) {
        return UriUtils.encodePathSegment(value, java.nio.charset.StandardCharsets.UTF_8);
    }

    private static String segments(String path) {
        return java.util.Arrays.stream(path.substring(1).split("/"))
                .map(MachineReading::segment)
                .collect(java.util.stream.Collectors.joining("/", "/", ""));
    }

    private static String label(String value) {
        if (value == null) return "";
        return value.replaceAll("[\\p{Cc}\\p{Zl}\\p{Zp}]+", " ")
                .replaceAll(" +", " ")
                .strip()
                .replace("\\", "\\\\")
                .replace("[", "\\[")
                .replace("]", "\\]")
                .replace("|", "\\|");
    }

    private record IndexEntry(String label, String path, String description) {}
}
