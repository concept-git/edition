package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.ZipPackSource;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.importformat.contract.ImportLimits;
import io.space.concepts.importformat.directory.SlugBook;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class PlainTreeAdapterTest {
    private final ImportFormatApi formats = io.space.concepts.importformat.StandardImportFormats.create(
            JsonMapper.builder().build());

    @Test
    void sniffsTreeMiniAsFileTreeOnlyAfterOkfDeclines() throws Exception {
        Path zip = ImportPacks.zipFixture("F-tree-mini");
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(formats.sniff(source.index(), source)).contains("file-tree");
        }
    }

    @Test
    void adaptsTreeMiniWithOriginalPathsBytesAndIndependentNavigation() throws Exception {
        Path zip = ImportPacks.zipFixture("F-tree-mini");
        InMemoryAdaptSink sink = new InMemoryAdaptSink();
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, sink);
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) result).pack();
            assertThat(pack.generator()).isEqualTo("file-tree");
            assertThat(pack.pages())
                    .extracting(AdaptedPack.Page::externalId)
                    .containsExactly(
                            "README",
                            "getting-started",
                            "02-guides/index",
                            "02-guides/faq",
                            "02-guides/install",
                            "reference/api");
            assertThat(pack.pages())
                    .extracting(AdaptedPack.Page::slug)
                    .containsExactly(
                            "README.md",
                            "01-getting-started.md",
                            "02-guides/index.md",
                            "02-guides/faq.html",
                            "02-guides/install.md",
                            "reference/api.html");
            assertThat(pack.pages())
                    .extracting(AdaptedPack.Page::title)
                    .containsExactly("Tree Mini Docs", "Getting Started", "Guides", "FAQ", "Install", "API");
            assertThat(pack.pages())
                    .extracting(AdaptedPack.Page::format)
                    .containsExactly("markdown", "markdown", "markdown", "html", "markdown", "html");

            AdaptedPack.Page started = pack.pages().get(1);
            assertThat(started.seo().description()).isEqualTo("First steps with tree-mini");
            assertThat(started.properties()).containsExactly(Map.entry("audience", "newcomers"));
            assertThat(started.content())
                    .isEqualTo(Files.readString(ImportPacks.tree("F-tree-mini").resolve("01-getting-started.md")));

            AdaptedPack.Page install = pack.pages().get(4);
            assertThat(install.attachments()).containsExactly("02-guides/img/arch.png");
            assertThat(install.content())
                    .isEqualTo(Files.readString(ImportPacks.tree("F-tree-mini").resolve("02-guides/install.md")));
            assertThat(pack.checksums())
                    .containsKey("02-guides/img/arch.png")
                    .containsKey("content/02-guides/install.md");

            AdaptedPack.Page faq = pack.pages().get(3);
            assertThat(faq.content())
                    .isEqualTo(Files.readString(ImportPacks.tree("F-tree-mini").resolve("02-guides/faq.html")));
            AdaptedPack.Page api = pack.pages().get(5);
            assertThat(api.content())
                    .isEqualTo(Files.readString(ImportPacks.tree("F-tree-mini").resolve("reference/api.html")));

            assertThat(pack.toc())
                    .extracting(AdaptedPack.TocNode::kind)
                    .containsExactly("target", "target", "group", "group");
            assertThat(pack.toc())
                    .extracting(AdaptedPack.TocNode::ref)
                    .containsExactly("README", "getting-started", null, null);
            AdaptedPack.TocNode guides = pack.toc().get(2);
            assertThat(guides.label()).isEqualTo("Guides");
            assertThat(guides.children())
                    .extracting(AdaptedPack.TocNode::ref)
                    .containsExactly("02-guides/index", "02-guides/faq", "02-guides/install");
            assertThat(pack.toc().get(3).label()).isEqualTo("Reference");

            assertThat(pack.pages()).noneMatch(page -> page.externalId().contains(".github"));
            assertThat(sink.issues())
                    .extracting(AdaptedPack.Issue::path)
                    .contains(".github/PULL_REQUEST_TEMPLATE.md", "LICENSE");
        }
    }

    @Test
    void gitHubWrapperDirectoryIsTransparent() throws Exception {
        Path zip = ImportPacks.wrappedZip("F-tree-mini", "AgenticWeb4-tourism-okf-0123abc");
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) result).pack();
            assertThat(pack.pages())
                    .extracting(AdaptedPack.Page::slug)
                    .contains("02-guides/install.md", "reference/api.html");
        }
    }

    @Test
    void frontmatterIdSurvivesAMoveWhilePathOnlyPagesDoNot() throws Exception {
        Path zip = ImportPacks.zipFixture("F-tree-mini-v2");
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) result).pack();
            Map<String, String> slugById = new LinkedHashMap<>();
            for (AdaptedPack.Page page : pack.pages()) slugById.put(page.externalId(), page.slug());
            assertThat(slugById)
                    .containsEntry("getting-started", "02-guides/03-getting-started.md")
                    .containsEntry("02-guides/api", "02-guides/api.html")
                    .doesNotContainKeys("reference/api", "02-guides/faq");
        }
    }

    @Test
    void packWithoutAnyPageFileStaysUnknown() throws Exception {
        Path zip = ImportPacks.zipFixture("F-unknown");
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(formats.sniff(source.index(), source)).isEmpty();
            assertThat(formats.adapt(source.index(), source, new InMemoryAdaptSink()))
                    .isInstanceOf(ImportFormatApi.Result.UnknownFormat.class);
        }
    }

    @Test
    void plainMarkdownWithIndexButNoOkfVersionIsFileTree() throws Exception {
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("index.md", "# Just a site\n".getBytes(StandardCharsets.UTF_8));
        files.put("page.md", "Body without heading\n".getBytes(StandardCharsets.UTF_8));
        Path zip = ImportPacks.zipEntries(files);
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(formats.sniff(source.index(), source)).contains("file-tree");
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted)
                            formats.adapt(source.index(), source, new InMemoryAdaptSink()))
                    .pack();
            assertThat(pack.pages()).extracting(AdaptedPack.Page::slug).containsExactly("index.md", "page.md");
            assertThat(pack.pages()).extracting(AdaptedPack.Page::title).containsExactly("Just a site", "page");
        }
    }

    @Test
    void importsSourceDocumentsWithoutParsingOrRewritingThem() throws Exception {
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("notes.txt", "<script>literal</script>\n".getBytes(StandardCharsets.UTF_8));
        files.put("config.json", "{\"value\":\"<unsafe>\"}\n".getBytes(StandardCharsets.UTF_8));
        files.put("schema.xml", "<root>&amp;</root>\n".getBytes(StandardCharsets.UTF_8));
        Path zip = ImportPacks.zipEntries(files);
        try (ZipPackSource source = new ZipPackSource(zip)) {
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted)
                            formats.adapt(source.index(), source, new InMemoryAdaptSink()))
                    .pack();
            assertThat(pack.pages()).extracting(AdaptedPack.Page::format).containsExactly("json", "txt", "xml");
            for (AdaptedPack.Page page : pack.pages()) {
                String original =
                        new String(files.get(page.externalId() + "." + page.format()), StandardCharsets.UTF_8);
                assertThat(page.content()).isEqualTo(original);
                assertThat(pack.checksums()).containsKey("content/" + page.externalId() + "." + page.format());
            }
        }
    }

    @Test
    void duplicateFrontmatterIdIsInvalid() throws Exception {
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("a.md", "---\nid: same\n---\n# A\n".getBytes(StandardCharsets.UTF_8));
        files.put("b.md", "---\nid: same\n---\n# B\n".getBytes(StandardCharsets.UTF_8));
        Path zip = ImportPacks.zipEntries(files);
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Invalid.class);
            assertThat(((ImportFormatApi.Result.Invalid) result).issues())
                    .extracting(AdaptedPack.Issue::code)
                    .containsExactly("duplicate_external_id");
        }
    }

    @Test
    void tooManyPageFilesIsInvalid() throws Exception {
        Map<String, byte[]> files = new LinkedHashMap<>();
        byte[] body = "# p\n".getBytes(StandardCharsets.UTF_8);
        for (int i = 0; i <= ImportLimits.MAX_PAGE_FILES; i++) files.put("p" + i + ".md", body);
        Path zip = ImportPacks.zipEntries(files);
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Invalid.class);
            assertThat(((ImportFormatApi.Result.Invalid) result).issues())
                    .extracting(AdaptedPack.Issue::code)
                    .containsExactly("too_many_files");
        }
    }

    @Test
    void propertyLimitsDropWithInfoInsteadOfFailing() throws Exception {
        StringBuilder front = new StringBuilder("---\n");
        for (int i = 0; i < ImportLimits.MAX_PROPERTIES + 1; i++)
            front.append("k").append(i).append(": v\n");
        front.append("long: ")
                .append("x".repeat(ImportLimits.MAX_PROPERTY_VALUE_CHARS + 1))
                .append("\n---\n# T\n");
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("t.md", front.toString().getBytes(StandardCharsets.UTF_8));
        Path zip = ImportPacks.zipEntries(files);
        InMemoryAdaptSink sink = new InMemoryAdaptSink();
        try (ZipPackSource source = new ZipPackSource(zip)) {
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) formats.adapt(source.index(), source, sink)).pack();
            assertThat(pack.pages().getFirst().properties()).hasSize(ImportLimits.MAX_PROPERTIES);
            assertThat(sink.issues()).extracting(AdaptedPack.Issue::code).contains("property_dropped");
        }
    }

    @Test
    void kebabPathFlattensSegmentsStripsOrderPrefixesAndKeepsUnicode() {
        assertThat(SlugBook.kebabPath("02-guides/install.md")).isEqualTo("guides-install");
        assertThat(SlugBook.kebabPath("02-guides/index.md")).isEqualTo("guides");
        assertThat(SlugBook.kebabPath("02-guides/README.md")).isEqualTo("guides");
        assertThat(SlugBook.kebabPath("README.md")).isEqualTo("readme");
        assertThat(SlugBook.kebabPath("docs/1. 快速开始/安装 指南.md")).isEqualTo("docs-快速开始-安装-指南");
        assertThat(SlugBook.kebabPath("2024/report.html")).isEqualTo("2024-report");
        String capped = SlugBook.kebabPath("a/".repeat(60) + "z.md");
        assertThat(capped.codePointCount(0, capped.length())).isLessThanOrEqualTo(80);
        assertThat(SlugBook.kebabPath("a/".repeat(60) + "z.md")).doesNotEndWith("-");
        assertThat(List.of(SlugBook.kebabPath("!!!.md"))).containsExactly("page");
    }
}
