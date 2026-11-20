package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.ZipPackSource;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import tools.jackson.databind.json.JsonMapper;

class IpdExportAdapterTest {
    private final ImportFormatApi formats = io.space.concepts.importformat.StandardImportFormats.create(
            JsonMapper.builder().build());

    @Test
    void importsTolerantPackWithoutConfusingMetadataDirectoryCodesAndPageIdentity() throws Exception {
        AdaptedPack pack = adapted(ImportPacks.zipFixture("F-ipd-tolerant"));
        assertThat(pack.pages())
                .extracting(AdaptedPack.Page::externalId)
                .containsExactly(
                        "intro.html",
                        "details.html",
                        "meta-only.html",
                        "fallback.html",
                        "guides/a/same.html",
                        "guides/b/same.html",
                        "class-only.html");
        AdaptedPack.Page intro = page(pack, "intro.html");
        assertThat(intro.title()).isEqualTo("产品介绍");
        assertThat(intro.seo().description()).isEqualTo("IPD 导入验证");
        assertThat(intro.seo().keywords()).isEqualTo("IPD,SEO");
        assertThat(intro.properties()).containsEntry("extension", "{\"edition\":\"test\",\"flags\":[1,2]}");
        assertThat(intro.content())
                .isEqualTo(Files.readString(ImportPacks.tree("F-ipd-tolerant").resolve("intro.html")));
        assertThat(page(pack, "details.html").title()).isEqualTo("详细说明");
        assertThat(page(pack, "details.html").seo()).isEqualTo(AdaptedPack.Seo.empty());
        assertThat(page(pack, "class-only.html").seo()).isEqualTo(AdaptedPack.Seo.empty());
        assertThat(page(pack, "fallback.html").title()).isEqualTo("fallback");
        assertThat(pack.toc()).extracting(AdaptedPack.TocNode::kind).containsExactly("group", "group");
        assertThat(pack.toc().get(1).label()).isEqualTo("other");
        List<AdaptedPack.TocNode> children = pack.toc().getFirst().children();
        assertThat(children)
                .extracting(AdaptedPack.TocNode::ref)
                .containsExactly(
                        "intro.html",
                        "class-only.html",
                        "intro.html",
                        "fallback.html",
                        "guides/a/same.html",
                        "guides/b/same.html");
        assertThat(children.getFirst().children().getFirst().ref()).isEqualTo("details.html");
        assertThat(page(pack, "guides/a/same.html").content()).contains("href=\"../b/same.html\"");
        assertThat(page(pack, "guides/b/same.html").content()).contains("href=\"../a/same.html\"");
    }

    @Test
    void realCodeartsMetadataIgnoresDockwAndPreservesNestedBusinessExtensions() throws Exception {
        AdaptedPack pack = adapted(ImportPacks.zipFixture("F-ipd-codearts-reference"));
        assertThat(pack.pages())
                .extracting(AdaptedPack.Page::externalId)
                .containsExactly("codeartsagent_pd_0001.html", "codeartsagent_pd_0003.html");
        var intro = pack.pages().getFirst();
        assertThat(intro.title()).isEqualTo("什么是华为云码道CodeArts");
        assertThat(intro.seo().keywords()).isEqualTo("什么是华为云码道CodeArts,产品介绍");
        assertThat(intro.properties())
                .containsEntry("node_id", "codeartsagent_pd_0001.xml")
                .containsEntry("metedata", "[{\"prodname\":\"codeartssnap\",\"documenttype\":\"productdesc\"}]");
        assertThat(pack.toc().getFirst().children())
                .extracting(AdaptedPack.TocNode::ref)
                .containsExactly("codeartsagent_pd_0001.html", "codeartsagent_pd_0003.html");
    }

    @Test
    void directoryRenumberingLeavesPageIdentitiesAndContentUnchanged() throws Exception {
        Map<String, byte[]> files = fixture();
        AdaptedPack before = adapted(ImportPacks.zipEntries(files));
        String klass = new String(files.get("CLASS.TXT.json"), StandardCharsets.UTF_8);
        files.put("CLASS.TXT.json", bytes(klass.replace("100", "900").replace("110", "910")));
        AdaptedPack after = adapted(ImportPacks.zipEntries(files));
        assertThat(after.pages()).isEqualTo(before.pages());
        assertThat(after.toc()).isEqualTo(before.toc());
    }

    @ParameterizedTest
    @ValueSource(strings = {"null", "true", "123", "{}", "[]", "\"\"", "\"   \""})
    void presentButInvalidUriRejectsBothManifests(String uri) throws Exception {
        assertInvalid("[{\"uri\":" + uri + "}]", "[]", "uri must be a non-empty string");
        assertInvalid("[]", "[{\"code\":1,\"uri\":" + uri + "}]", "uri must be a non-empty string");
    }

    @ParameterizedTest
    @MethodSource("invalidTrees")
    void invalidDirectoryStructureIsRejectedBeforeTraversal(String klass) throws Exception {
        assertInvalid("[]", klass, null);
    }

    static Stream<String> invalidTrees() {
        return Stream.of(
                "[{\"code\":\"\"}]",
                "[{}]",
                "[{\"code\":true}]",
                "[{\"code\":{}}]",
                "[null]",
                "[{\"code\":1},{\"code\":\"1\"}]",
                "[{\"code\":1,\"p_code\":\"missing\"}]",
                "[{\"code\":1,\"p_code\":false}]",
                "[{\"code\":1,\"p_code\":1}]",
                "[{\"code\":1,\"p_code\":2},{\"code\":2,\"p_code\":1}]",
                "[{\"code\":\"root\"},{\"code\":1,\"p_code\":2},{\"code\":2,\"p_code\":1}]");
    }

    @Test
    void missingParentReportIdentifiesTheExactSourceRowAndField() throws Exception {
        var result = invalid(zip("[]", "[{\"code\":1},{\"code\":2,\"p_code\":9}]", Map.of()));
        assertThat(result.issues().getFirst().path()).isEqualTo("CLASS[1].p_code");
        assertThat(result.issues().getFirst().detail()).contains("missing parent: 9");
    }

    @Test
    void depthLimitStopsTraversalAndAcceptsBoundary() throws Exception {
        var rows = new java.util.ArrayList<Map<String, Object>>();
        for (int i = 1; i <= 7; i++) rows.add(Map.of("code", i, "p_code", i == 1 ? "" : String.valueOf(i - 1)));
        JsonMapper json = JsonMapper.builder().build();
        adapted(zip("[{\"uri\":\"intro.html\"}]", json.writeValueAsString(rows), Map.of("intro.html", "<p>ok</p>")));
        rows.add(Map.of("code", 8, "p_code", 7));
        ImportFormatApi.Result.Invalid invalid = invalid(zip("[]", json.writeValueAsString(rows), Map.of()));
        assertThat(invalid.issues()).extracting(AdaptedPack.Issue::code).contains("toc_depth_exceeded");
    }

    @Test
    void duplicateMetadataMergesOnlyWhenEffectiveContentsAgree() throws Exception {
        String same = "[{\"uri\":\"intro.html\",\"code\":1},{\"uri\":\"./intro.html\",\"code\":9,\"des\":{}}]";
        assertThat(adapted(zip(same, "[]", Map.of("intro.html", "<h1>Intro</h1>")))
                        .pages())
                .hasSize(1);
        assertInvalid(
                "[{\"uri\":\"intro.html\",\"des\":\"A\"},{\"uri\":\"intro.html\",\"des\":\"B\"}]",
                "[]",
                "conflicting metadata");
        assertInvalid(
                "[{\"uri\":\"intro.html\",\"custom\":1},{\"uri\":\"intro.html\",\"custom\":2}]",
                "[]",
                "conflicting metadata");
    }

    @Test
    void filenameFallbackRequiresUniquenessAndExactPathWins() throws Exception {
        Map<String, String> html = Map.of("a/intro.html", "<h1>A</h1>", "b/intro.html", "<h1>B</h1>");
        assertThat(invalid(zip("[{\"uri\":\"intro.html\"}]", "[]", html))
                        .issues()
                        .getFirst()
                        .detail())
                .contains("ambiguous html");
        assertThat(adapted(zip("[{\"uri\":\"a/intro.html\"}]", "[]", html))
                        .pages()
                        .getFirst()
                        .externalId())
                .isEqualTo("a/intro.html");
        assertThat(adapted(zip("[{\"uri\":\"old/intro.html\"}]", "[]", Map.of("a/intro.html", "<p>A</p>")))
                        .pages()
                        .getFirst()
                        .externalId())
                .isEqualTo("a/intro.html");
        assertThat(adapted(zip("[{\"uri\":\"./a\\\\intro.html\"}]", "[]", html))
                        .pages()
                        .getFirst()
                        .externalId())
                .isEqualTo("a/intro.html");
        assertInvalid("[{\"uri\":\"missing.html\"}]", "[]", "missing html");
        assertInvalid("[{\"uri\":\"../intro.html\"}]", "[]", "package-relative");
        assertInvalid("[{\"uri\":\"https://example.com/intro.html\"}]", "[]", "package-relative");
    }

    @Test
    void titleFallbacksAndOverlongTitlesAreValidatedBeforeMirroring() throws Exception {
        AdaptedPack pack = adapted(zip(
                "[{\"uri\":\"intro.html\",\"title\":false}]",
                "[]",
                Map.of("intro.html", "<title>Document title</title><h1>Heading</h1>")));
        assertThat(pack.pages().getFirst().title()).isEqualTo("Document title");
        assertThat(adapted(zip("[{\"uri\":\"intro.html\"}]", "[]", Map.of("intro.html", "<h1>Heading</h1>")))
                        .pages()
                        .getFirst()
                        .title())
                .isEqualTo("Heading");
        String tooLong = "中".repeat(201);
        assertInvalid("[{\"uri\":\"intro.html\",\"title\":\"" + tooLong + "\"}]", "[]", "1–200");
        assertInvalid("[]", "[{\"code\":1,\"title\":\"" + tooLong + "\"}]", "1–200");
        String emojiTitle = "😀".repeat(200);
        assertThat(adapted(zip(
                                "[{\"uri\":\"intro.html\",\"title\":\"" + emojiTitle + "\"}]",
                                "[]",
                                Map.of("intro.html", "<p>ok</p>")))
                        .pages()
                        .getFirst()
                        .title())
                .isEqualTo(emojiTitle);
    }

    @Test
    void unrelatedRowsAndUnsupportedExtensionsDoNotBlockPages() throws Exception {
        var row = new LinkedHashMap<String, Object>();
        row.put("uri", "intro.html");
        row.put("des", "x".repeat(501));
        row.put("kw", false);
        row.put("invalid.key", "ignored");
        row.put("huge", "x".repeat(1025));
        for (int i = 0; i < 40; i++) row.put("custom" + i, Map.of("nested", i));
        String meta = new JsonMapper().writeValueAsString(List.of(Map.of("dockw", "产品介绍"), "extension", row));
        AdaptedPack pack = adapted(zip(meta, "[]", Map.of("intro.html", "<h1>Intro</h1>")));
        assertThat(pack.pages()).hasSize(1);
        assertThat(pack.pages().getFirst().seo()).isEqualTo(AdaptedPack.Seo.empty());
        assertThat(pack.pages().getFirst().properties()).hasSize(32).doesNotContainKeys("invalid.key", "huge");
        assertThat(pack.info()).extracting(AdaptedPack.Issue::code).contains("property_dropped");
    }

    @Test
    @org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable(named = "IPD_TEST_PACK_DIR", matches = ".+")
    void verifiesEveryGeneratedDeliverableZipAgainstItsDeclaredOutcome() throws Exception {
        Path directory = Path.of(System.getenv("IPD_TEST_PACK_DIR"));
        var cases = new JsonMapper().readTree(Files.readString(directory.resolve("cases.json")));
        for (var testCase : cases) {
            Path zip = directory.resolve(testCase.get("file").asString());
            assertThat(Sha256.hex(Files.readAllBytes(zip)))
                    .isEqualTo(testCase.get("sha256").asString());
            if (testCase.get("expected").asString().equals("adapted")) {
                assertThat(adapted(zip).pages()).hasSize(testCase.get("pages").asInt());
            } else {
                assertThat(invalid(zip).issues()).isNotEmpty();
            }
        }
    }

    @Test
    void emptyAndFilteredEmptyPacksAreRejected() throws Exception {
        assertInvalid("[]", "[]", "no importable pages");
        assertInvalid("[{\"dockw\":\"产品介绍\"}]", "[{\"code\":1}]", "no importable pages");
    }

    @Test
    void metaOrderAndNewCollisionsDoNotChangeExistingRoutes() throws Exception {
        Map<String, String> html = Map.of("a/same.html", "<p>A</p>", "b/same.html", "<p>B</p>");
        var first = adapted(zip("[{\"uri\":\"a/same.html\"},{\"uri\":\"b/same.html\"}]", "[]", html));
        var second = adapted(zip("[{\"uri\":\"b/same.html\"},{\"uri\":\"a/same.html\"}]", "[]", html));
        assertThat(page(first, "a/same.html").slug())
                .isEqualTo(page(second, "a/same.html").slug());
        assertThat(page(first, "b/same.html").slug())
                .isEqualTo(page(second, "b/same.html").slug());
        var alone = adapted(zip("[{\"uri\":\"b/same.html\"}]", "[]", html));
        assertThat(alone.pages().getFirst().slug())
                .isEqualTo(page(second, "b/same.html").slug());
        String name = "a".repeat(120) + ".html";
        var longName = adapted(zip("[{\"uri\":\"" + name + "\"}]", "[]", Map.of(name, "<p>long</p>")));
        assertThat(longName.pages().getFirst().slug()).isEqualTo(name);
    }

    @ParameterizedTest
    @ValueSource(strings = {"<a href='missing.html'>Lost link</a>"})
    void brokenReferencesAreRejectedBeforeSanitizing(String html) throws Exception {
        var result = invalid(zip("[{\"uri\":\"intro.html\"}]", "[]", Map.of("intro.html", html)));
        assertThat(result.issues().getFirst().code()).isEqualTo("broken_local_reference");
    }

    @Test
    void missingImageIsReportedAndOriginalHtmlIsPreserved() throws Exception {
        String html = "<!doctype html>\r\n<html><head><title>Original</title></head><body>"
                + "<img src='missing.png' onerror='fallback()'><script>var x=1;</script></body></html>\n";
        var pack = adapted(zip("[{\"uri\":\"intro.html\"}]", "[]", Map.of("intro.html", html)));
        assertThat(pack.pages().getFirst().content()).isEqualTo(html);
        assertThat(pack.info()).extracting(AdaptedPack.Issue::code).contains("unresolved_image");
    }

    @Test
    void corruptClassJsonNamesTheActualManifestInItsReport() throws Exception {
        var result = invalid(zip("[]", "[broken", Map.of()));
        assertThat(result.issues().getFirst().path()).isEqualTo("CLASS.TXT.json");
        assertThat(result.issues().getFirst().code()).isEqualTo("unreadable_manifest");
    }

    private void assertInvalid(String meta, String klass, String detail) throws Exception {
        var invalid = invalid(zip(meta, klass, Map.of("intro.html", "<h1>Intro</h1>")));
        assertThat(invalid.issues()).isNotEmpty();
        if (detail != null) assertThat(invalid.issues().getFirst().detail()).contains(detail);
    }

    private ImportFormatApi.Result.Invalid invalid(Path zip) throws Exception {
        ImportFormatApi.Result result = adapt(zip);
        assertThat(result).isInstanceOf(ImportFormatApi.Result.Invalid.class);
        return (ImportFormatApi.Result.Invalid) result;
    }

    private AdaptedPack adapted(Path zip) throws Exception {
        ImportFormatApi.Result result = adapt(zip);
        assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
        return ((ImportFormatApi.Result.Adapted) result).pack();
    }

    private ImportFormatApi.Result adapt(Path zip) throws Exception {
        try (ZipPackSource source = new ZipPackSource(zip)) {
            return formats.adapt(source.index(), source, new InMemoryAdaptSink());
        }
    }

    private static AdaptedPack.Page page(AdaptedPack pack, String id) {
        return pack.pages().stream()
                .filter(page -> page.externalId().equals(id))
                .findFirst()
                .orElseThrow();
    }

    private static Map<String, byte[]> fixture() throws Exception {
        Path root = ImportPacks.tree("F-ipd-tolerant");
        Map<String, byte[]> files = new LinkedHashMap<>();
        try (var walk = Files.walk(root)) {
            for (Path file : walk.filter(Files::isRegularFile).sorted().toList()) {
                files.put(root.relativize(file).toString().replace('\\', '/'), Files.readAllBytes(file));
            }
        }
        return files;
    }

    private static Path zip(String meta, String klass, Map<String, String> html) throws Exception {
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("ALL_META.TXT.json", bytes(meta));
        files.put("CLASS.TXT.json", bytes(klass));
        html.forEach((name, content) -> files.put(name, bytes(content)));
        return ImportPacks.zipEntries(files);
    }

    private static byte[] bytes(String value) {
        return value.getBytes(StandardCharsets.UTF_8);
    }
}
