package io.space.contentapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.delivery.contract.SiteSnapshot;
import io.space.contentapp.compositions.machine.MachineReading;
import io.space.contentapp.compositions.page.ContentPageRenderer;
import io.space.contentapp.compositions.shared.ContentProblem;
import io.space.contentapp.entry.persistence.PublicationPages.PageAccess;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MachineReadingTest {
    private final UUID spaceId = UUID.randomUUID();
    private final UUID introId = UUID.randomUUID();
    private final UUID hiddenId = UUID.randomUUID();
    private final UUID noIndexId = UUID.randomUUID();
    private final MachineReading machine = new MachineReading(new ContentPageRenderer());

    @Test
    void indexesOnlyAnonymousTocTargetsAndPreservesGroupOrder() {
        var context = space();
        var pages = List.of(
                new PageAccess(introId, spaceId, "/guide/intro", false, "开始使用"),
                new PageAccess(hiddenId, spaceId, "/guide/hidden", false, "不在目录"),
                new PageAccess(noIndexId, spaceId, "/guide/secret", true, "不收录"));

        assertThat(machine.siteIndex(brand("index"), List.of(context), pages, "https://docs.example.com"))
                .contains("# 产品文档", "https://docs.example.com/guide/llms.txt");
        assertThat(machine.spaceIndex(brand("index"), context, pages, "https://docs.example.com"))
                .contains("## 入门", "[安装](https://docs.example.com/guide/intro?view=markdown): 开始使用")
                .doesNotContain("hidden", "secret", "外部");
    }

    @Test
    void siteNoindexSuppressesIndexButNotReadableMarkdownPage() {
        var context = space();
        assertThatThrownBy(() ->
                        machine.siteIndex(brand("noindex"), List.of(context), List.of(), "https://docs.example.com"))
                .isInstanceOf(ContentProblem.class)
                .hasFieldOrPropertyWithValue("status", 404);
        var page = page(introId, "MARKDOWN", "## 步骤\n\n- 安装\n- 配置");
        assertThat(machine.markdown(page, "/guide/intro")).contains("# 安装", "## 步骤", "- 安装", "- 配置");
    }

    @Test
    void htmlPageConvertsHeadingsLinksTableAndCodeWithoutScripts() {
        var page = page(
                introId,
                "HTML",
                "<h2>步骤</h2><p><a href=\"/guide/next\">下一页</a></p>"
                        + "<table><tr><th>键</th><th>值</th></tr><tr><td>A</td><td>B</td></tr></table>"
                        + "<pre><code>run()</code></pre><img src=\"logo.png\" alt=\"标志\">"
                        + "<script>steal()</script>",
                List.of(new SiteSnapshot.Attachment("logo.png", "key", "hash")));
        assertThat(new ContentPageRenderer().render(page, "/guide/intro").html())
                .contains("href=\"/guide/next\"");
        assertThat(machine.markdown(page, "/guide/intro"))
                .contains("# 安装", "## 步骤", "[下一页](/guide/next)", "![标志](/guide/logo.png)", "键", "值", "run()")
                .doesNotContain("steal()");
    }

    @Test
    void sourcePageIsAvailableToMachineReadersAsLiteralCode() {
        var source = "<root key=\"literal\">value</root>\n```";
        assertThat(machine.markdown(page(introId, "XML", source), "/guide/intro"))
                .contains("````xml\n" + source + "\n````");
    }

    private static SiteSnapshot.Brand brand(String robots) {
        return new SiteSnapshot.Brand("产品文档", null, null, null, "zh-CN", null, null, robots);
    }

    private SiteSnapshot.Space space() {
        var nav = List.of(
                new SiteSnapshot.Node(
                        "入门",
                        "group",
                        null,
                        null,
                        List.of(
                                new SiteSnapshot.Node("安装", "target", "/guide/intro", introId, List.of()),
                                new SiteSnapshot.Node("安装重复", "target", "/guide/intro", introId, List.of()),
                                new SiteSnapshot.Node("不收录", "target", "/guide/secret", noIndexId, List.of()))),
                new SiteSnapshot.Node("外部", "link", "https://example.com", null, List.of()));
        return new SiteSnapshot.Space(spaceId, "guide", "使用指南", UUID.randomUUID(), nav);
    }

    private SiteSnapshot.Page page(UUID id, String format, String content) {
        return page(id, format, content, List.of());
    }

    private SiteSnapshot.Page page(UUID id, String format, String content, List<SiteSnapshot.Attachment> attachments) {
        return new SiteSnapshot.Page(
                id,
                spaceId,
                UUID.randomUUID(),
                "/guide/intro",
                "安装",
                format,
                "hash",
                content,
                Map.of(),
                Map.of(),
                attachments,
                Instant.now());
    }
}
