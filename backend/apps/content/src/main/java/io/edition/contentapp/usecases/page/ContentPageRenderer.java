package io.edition.contentapp.usecases.page;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.vladsch.flexmark.ext.gfm.strikethrough.StrikethroughExtension;
import com.vladsch.flexmark.ext.gfm.tasklist.TaskListExtension;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.data.DataHolder;
import com.vladsch.flexmark.util.data.MutableDataSet;
import io.edition.content.DocumentFormat;
import io.edition.delivery.contract.SiteSnapshot;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

/** 为 llms.txt 与 ?view=markdown 消毒快照正文，并只缓存与内容哈希绑定的结果。 */
@Component
public final class ContentPageRenderer {
    // 已发布渲染配置：contracts/markdown-rendering.md；由共享黄金样例守门。
    private static final DataHolder MARKDOWN_OPTIONS = new MutableDataSet()
            .set(
                    Parser.EXTENSIONS,
                    List.of(TablesExtension.create(), TaskListExtension.create(), StrikethroughExtension.create()))
            .set(TablesExtension.MAX_HEADER_ROWS, 1)
            .set(TablesExtension.COLUMN_SPANS, false)
            .set(TablesExtension.APPEND_MISSING_COLUMNS, true)
            .set(TablesExtension.DISCARD_EXTRA_COLUMNS, true)
            .set(TaskListExtension.ITEM_DONE_MARKER, "☑ ")
            .set(TaskListExtension.ITEM_NOT_DONE_MARKER, "☐ ")
            .toImmutable();

    private static final long MAX_WEIGHT = 128L * 1024 * 1024;
    private static final Safelist SAFE = Safelist.relaxed()
            .preserveRelativeLinks(true)
            .addTags("del", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "pre", "code")
            .addAttributes("th", "colspan", "rowspan", "align")
            .addAttributes("td", "colspan", "rowspan", "align")
            .addAttributes("code", "class");

    private final Parser markdown = Parser.builder(MARKDOWN_OPTIONS).build();
    private final HtmlRenderer html = HtmlRenderer.builder(MARKDOWN_OPTIONS).build();
    private final Cache<String, CachedBody> bodies = Caffeine.newBuilder()
            .maximumWeight(MAX_WEIGHT)
            .weigher(
                    (String key, CachedBody value) -> Math.max(1, value.html().getBytes(StandardCharsets.UTF_8).length))
            .build();

    public RenderedBody render(SiteSnapshot.Page page, String pagePath) {
        String hash = page.contentHash();
        String key = page.format() + ':' + hash;
        CachedBody cached = bodies.get(key, ignored -> sanitize(page));
        Document document = Jsoup.parseBodyFragment(cached.html());
        Element first = document.body().children().first();
        if (first != null
                && first.tagName().equals("h1")
                && first.text().strip().equals(page.title().strip())) first.remove();
        rewriteAttachments(document, page.attachments(), pagePath);
        return new RenderedBody(document.body().html(), cached.headings(), cached.plainText());
    }

    private CachedBody sanitize(SiteSnapshot.Page page) {
        String source =
                switch (DocumentFormat.fromStored(page.format()).bodyKind()) {
                    case MARKDOWN -> html.render(markdown.parse(page.content()));
                    case HTML -> page.content();
                    case SOURCE -> "<pre><code>" + HtmlUtils.htmlEscape(page.content()) + "</code></pre>";
                };
        Document document = Jsoup.parseBodyFragment(Jsoup.clean(source, SAFE));
        List<Heading> headings = addHeadingIds(document);
        return new CachedBody(document.body().html(), headings, document.text());
    }

    private static List<Heading> addHeadingIds(Document document) {
        var used = new HashMap<String, Integer>();
        var headings = new ArrayList<Heading>();
        for (Element heading : document.select("h2, h3")) {
            String base = slug(heading.text());
            int occurrence = used.merge(base, 1, Integer::sum);
            String id = occurrence == 1 ? base : base + '-' + occurrence;
            heading.attr("id", id);
            headings.add(new Heading(heading.tagName().equals("h2") ? 2 : 3, heading.text(), id));
        }
        return List.copyOf(headings);
    }

    private static String slug(String value) {
        String normalized = value.toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? "section" : normalized;
    }

    private static void rewriteAttachments(
            Document document, List<SiteSnapshot.Attachment> attachments, String pagePath) {
        Map<String, String> paths = new LinkedHashMap<>();
        for (var attachment : attachments) {
            paths.put(
                    attachment.path(), "/" + pagePath.substring(1, pagePath.indexOf('/', 1)) + "/" + attachment.path());
            paths.put(
                    "./" + attachment.path(),
                    "/" + pagePath.substring(1, pagePath.indexOf('/', 1)) + "/" + attachment.path());
        }
        document.select("[src]").forEach(element -> replace(element, "src", paths));
        document.select("[href]").forEach(element -> replace(element, "href", paths));
    }

    private static void replace(Element element, String attribute, Map<String, String> paths) {
        String replacement = paths.get(element.attr(attribute));
        if (replacement != null) element.attr(attribute, replacement);
    }

    public record Heading(int level, String text, String id) {}

    public record RenderedBody(String html, List<Heading> headings, String plainText) {}

    private record CachedBody(String html, List<Heading> headings, String plainText) {}
}
