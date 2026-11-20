package io.space.control.compositions.authoring.pageediting;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import org.jsoup.Jsoup;
import org.junit.jupiter.api.Test;

class MarkdownRenderingProfileTest {
    @Test
    void supportsEditorMarkdownWithoutWeakeningSanitization() throws java.io.IOException {
        String source = Files.readString(
                Path.of(System.getProperty("space.backend.root")).getParent().resolve("contracts/markdown-profile.md"));
        String html = new PageRenderer().render("markdown", source);
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
