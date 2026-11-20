package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.ZipPackSource;
import io.space.concepts.importformat.contract.AdaptSink;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.importformat.directory.SlugBook;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class ImportFormatAdaptTest {
    static final String PIXEL_SHA = "ebf4f635a17d10d6eb46ba680b70142419aa3220f228001a036d311a22ee9d2a";

    private final ImportFormatApi formats = io.space.concepts.importformat.StandardImportFormats.create(
            JsonMapper.builder().build());

    @Test
    void adaptV1GoldenPagesTocAndAttachmentSha() throws Exception {
        Path zip = ImportPacks.zipFixture("F-v1-ok");
        InMemoryAdaptSink sink = new InMemoryAdaptSink();
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, sink);
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) result).pack();
            assertThat(((ImportFormatApi.Result.Adapted) result).adapterId()).isEqualTo("bundle-v1");
            assertThat(pack.generator()).isEqualTo("bundle-v1");
            assertThat(pack.pages()).extracting(AdaptedPack.Page::externalId).containsExactly("welcome", "guide");
            assertThat(pack.pages()).extracting(AdaptedPack.Page::slug).containsExactly("welcome", "guide");
            assertThat(pack.pages()).extracting(AdaptedPack.Page::format).containsOnly("markdown");
            assertThat(pack.toc()).extracting(AdaptedPack.TocNode::ref).containsExactly("welcome", "guide");
            assertThat(pack.toc()).extracting(AdaptedPack.TocNode::kind).containsOnly("target");
            assertThat(pack.pages().getFirst().attachments()).contains("attachments/pixel.png");
            assertThat(pack.checksums().get("attachments/pixel.png")).isEqualTo(PIXEL_SHA);
            AdaptSink.StoredAttachment stored = sink.stored().get("attachments/pixel.png");
            assertThat(stored).isNotNull();
            assertThat(stored.sha256()).isEqualTo(PIXEL_SHA);
            assertThat(stored.storageKey()).isEqualTo(PIXEL_SHA);
            assertThat(stored.mime()).isEqualTo("image/png");
            assertThat(stored.size()).isEqualTo(67);
        }
    }

    @Test
    void adaptHwMiniUsesUriIdentityAndHwcloudGenerator() throws Exception {
        Path zip = ImportPacks.zipFixture("F-hw-mini");
        InMemoryAdaptSink sink = new InMemoryAdaptSink();
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, sink);
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) result).pack();
            assertThat(pack.generator()).isEqualTo("hwcloud-docs");
            assertThat(pack.pages())
                    .extracting(AdaptedPack.Page::externalId)
                    .containsExactly("intro.html", "setup.html");
            assertThat(pack.pages()).extracting(AdaptedPack.Page::slug).containsExactly("intro.html", "setup.html");
            assertThat(pack.pages()).extracting(AdaptedPack.Page::format).containsOnly("html");
            assertThat(pack.pages()).noneMatch(page -> page.externalId().contains("orphan"));
            AdaptedPack.Page intro = pack.pages().getFirst();
            assertThat(intro.seo().description()).isEqualTo("Introduction");
            assertThat(intro.seo().keywords()).isEqualTo("intro");
            assertThat(intro.properties())
                    .containsEntry("product_code", "ecs")
                    .containsEntry("doc_type", "api")
                    .containsEntry("githuburl", "https://example.com/intro.md");
            assertThat(intro.content())
                    .isEqualTo(java.nio.file.Files.readString(
                            ImportPacks.tree("F-hw-mini").resolve("intro.html")));
            assertThat(intro.attachments()).contains("attachments/pixel.png");
            assertThat(pack.toc()).extracting(AdaptedPack.TocNode::ref).containsExactly("intro.html");
            assertThat(pack.toc().getFirst().children())
                    .extracting(AdaptedPack.TocNode::ref)
                    .containsExactly("setup.html");
            assertThat(infoCodes(pack, sink)).contains("unlisted_page");
        }
    }

    @Test
    void adaptOkfMiniGroupsIndexAndStoresOkfPropertiesAsStrings() throws Exception {
        Path zip = ImportPacks.zipFixture("F-okf-mini");
        InMemoryAdaptSink sink = new InMemoryAdaptSink();
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, sink);
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) result).pack();
            assertThat(pack.generator()).isEqualTo("okf-v0.1");
            assertThat(pack.pages())
                    .extracting(AdaptedPack.Page::externalId)
                    .containsExactly("tour-guide/welcome", "tour-guide/city/beijing", "tour-guide/city/shanghai");
            assertThat(pack.pages())
                    .extracting(AdaptedPack.Page::externalId)
                    .doesNotContain("tour-guide/index", "tour-guide/city/index");
            AdaptedPack.Page welcome = pack.pages().getFirst();
            assertThat(welcome.format()).isEqualTo("markdown");
            assertThat(welcome.properties()).containsEntry("okf_type", "page");
            assertThat(welcome.properties().get("okf_tags")).isInstanceOf(String.class);
            assertThat(welcome.properties().get("okf_tags")).contains("intro").contains("start");
            assertThat(welcome.properties().get("okf_tags")).doesNotStartWith("[");
            assertThat(pack.toc()).isNotEmpty();
            assertThat(pack.toc().getFirst().kind()).isEqualTo("group");
            assertThat(pack.toc().getFirst().label()).isEqualTo("Tour Guide");
            assertThat(pack.toc().getFirst().ref()).isNull();
        }
    }

    @Test
    void adaptOkfMiniThroughGithubZipballWrapper() throws Exception {
        Path zip = ImportPacks.wrappedZip("F-okf-mini", "AgenticWeb4-tourism-okf-deadbeef");
        InMemoryAdaptSink sink = new InMemoryAdaptSink();
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, sink);
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) result).pack();
            assertThat(pack.generator()).isEqualTo("okf-v0.1");
            assertThat(pack.pages())
                    .extracting(AdaptedPack.Page::externalId)
                    .containsExactly("tour-guide/welcome", "tour-guide/city/beijing", "tour-guide/city/shanghai");
        }
    }

    @Test
    void cssAndJsAreSkippedAsInfoNotInvalid() throws Exception {
        Path zip = ImportPacks.zipFixture("F-hw-mini");
        InMemoryAdaptSink sink = new InMemoryAdaptSink();
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, sink);
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            List<AdaptedPack.Issue> info = infoIssues(((ImportFormatApi.Result.Adapted) result).pack(), sink);
            assertThat(info)
                    .anyMatch(issue -> "skipped_file".equals(issue.code())
                            && issue.path() != null
                            && issue.path().endsWith("skip.css"));
            assertThat(info)
                    .anyMatch(issue -> "skipped_file".equals(issue.code())
                            && issue.path() != null
                            && issue.path().endsWith("skip.js"));
            assertThat(result).isNotInstanceOf(ImportFormatApi.Result.Invalid.class);
        }
    }

    @Test
    void kebabFilenameTurnsHuaweiUnderscoresIntoValidSlugs() {
        assertThat(SlugBook.kebabFilename("ecs_01_0007.html")).isEqualTo("ecs-01-0007");
        assertThat(SlugBook.kebabFilename("ECS_02_1100.HTML")).isEqualTo("ecs-02-1100");
    }

    @Test
    void v1ChecksumMismatchIsInvalid() throws Exception {
        Path zip = ImportPacks.zipFixture("F-v1-bad-checksum");
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Invalid.class);
            ImportFormatApi.Result.Invalid invalid = (ImportFormatApi.Result.Invalid) result;
            assertThat(invalid.issues()).extracting(AdaptedPack.Issue::code).contains("checksum_mismatch");
        }
    }

    private static List<AdaptedPack.Issue> infoIssues(AdaptedPack pack, InMemoryAdaptSink sink) {
        return pack.info().isEmpty() ? sink.issues() : pack.info();
    }

    private static List<String> infoCodes(AdaptedPack pack, InMemoryAdaptSink sink) {
        return infoIssues(pack, sink).stream().map(AdaptedPack.Issue::code).toList();
    }
}
