package io.edition.control.usecases.authoring.pageediting;

import com.vladsch.flexmark.ext.gfm.strikethrough.StrikethroughExtension;
import com.vladsch.flexmark.ext.gfm.tasklist.TaskListExtension;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.data.DataHolder;
import com.vladsch.flexmark.util.data.MutableDataSet;
import io.edition.content.DocumentFormat;
import java.util.List;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

/** 预览渲染：标记格式按语义渲染，源码格式转义显示，输出统一清洗。 */
@Component
public class PageRenderer {
    // Published rendering profile: contracts/markdown-rendering.md; guarded by shared golden input.
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

    private final Parser parser = Parser.builder(MARKDOWN_OPTIONS).build();
    private final HtmlRenderer renderer = HtmlRenderer.builder(MARKDOWN_OPTIONS).build();
    private final Safelist safelist = Safelist.relaxed()
            .addTags("del", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "pre", "code")
            .addAttributes("th", "colspan", "rowspan", "align")
            .addAttributes("td", "colspan", "rowspan", "align");

    public String render(String format, String content) {
        DocumentFormat parsed =
                DocumentFormat.fromWire(format).orElseThrow(PageEditingTypes.FormatInvalidException::new);
        String html =
                switch (parsed.bodyKind()) {
                    case MARKDOWN -> renderer.render(parser.parse(content));
                    case HTML -> content;
                    case SOURCE -> "<pre><code>" + HtmlUtils.htmlEscape(content) + "</code></pre>";
                };
        return Jsoup.clean(html, safelist);
    }
}
