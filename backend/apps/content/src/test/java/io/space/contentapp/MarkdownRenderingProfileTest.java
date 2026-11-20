package io.space.contentapp;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.delivery.contract.SiteSnapshot;
import io.space.contentapp.compositions.page.ContentPageRenderer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.jsoup.Jsoup;
import org.junit.jupiter.api.Test;

class MarkdownRenderingProfileTest {
    @Test
    void sourceDocumentsRenderLiterallyWithoutExecutingMarkup() {
        for (String format : List.of("TXT", "JSON", "XML")) {
            String source = "<script>alert(1)</script>\n<root key=\"v\">&amp;</root>";
            var page = new SiteSnapshot.Page(
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    "/docs/source",
                    "Source",
                    format,
                    "source-v1",
                    source,
                    Map.of(),
                    Map.of(),
                    List.of(),
                    null);
            var body = new ContentPageRenderer().render(page, page.path());
            var document = Jsoup.parseBodyFragment(body.html());
            assertThat(document.select("script, root")).isEmpty();
            assertThat(document.select("pre code").text()).isEqualTo(source);
            assertThat(body.plainText()).contains("alert(1)", "key=\"v\"");
        }
    }

    @Test
    void removesOnlyTheRepeatedPageTitleFromRenderedBody() {
        var page = new SiteSnapshot.Page(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                "/docs/guide",
                "Guide",
                "MARKDOWN",
                "title-v1",
                "# Guide\n\n## Details\n\nBody",
                Map.of(),
                Map.of(),
                List.of(),
                null);
        var body = new ContentPageRenderer().render(page, page.path());
        assertThat(Jsoup.parseBodyFragment(body.html()).select("h1")).isEmpty();
        assertThat(Jsoup.parseBodyFragment(body.html()).select("h2").text()).isEqualTo("Details");
    }

    @Test
    void supportsEditorMarkdownWithoutWeakeningSanitization() throws java.io.IOException {
        String source = Files.readString(Path.of("../../../contracts/markdown-profile.md"));
        String html = new ContentPageRenderer()
                .render(
                        new SiteSnapshot.Page(
                                UUID.randomUUID(),
                                UUID.randomUUID(),
                                UUID.randomUUID(),
                                "/docs/guide",
                                "Guide",
                                "MARKDOWN",
                                "profile-v1",
                                source,
                                Map.of(),
                                Map.of(),
                                List.of(),
                                null),
                        "/docs/guide")
                .html();
        var document = Jsoup.parseBodyFragment(html);
        assertThat(document.select("table")).hasSize(1);
        assertThat(document.select("th")).hasSize(2);
        assertThat(document.select("th"))
                .extracting(element -> element.attr("align"))
                .containsExactly("left", "right");
        assertThat(document.select("tbody td"))
                .extracting(org.jsoup.nodes.Element::text)
                .containsExactly("文档", "已就绪");
        assertThat(document.select("del").text()).isEqualTo("旧内容");
        assertThat(document.text()).contains("☑ 已完成", "☐ 待处理", "新内容");
        assertThat(document.select("script, [onclick], input, a[href]")).isEmpty();
    }
}
