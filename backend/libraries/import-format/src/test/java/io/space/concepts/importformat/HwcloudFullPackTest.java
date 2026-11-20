package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.PackPaths;
import io.space.concepts.importformat.archive.ZipPackSource;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.importformat.contract.PackSource;
import java.io.InputStream;
import java.nio.file.Path;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

class HwcloudFullPackTest {
    private final ImportFormatApi formats = io.space.concepts.importformat.StandardImportFormats.create(
            JsonMapper.builder().build());
    private final JsonMapper json = JsonMapper.builder().build();

    static boolean fullZipPresent() {
        return ImportPacks.hwFullZip() != null;
    }

    @Test
    @Tag("slow")
    @EnabledIf("fullZipPresent")
    void importsEcsReferenceAndReportsMissingImagesWithoutRemovingTheirSourceReferences() throws Exception {
        Path zip = ImportPacks.hwFullZip();
        InMemoryAdaptSink sink = new InMemoryAdaptSink();
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(formats.sniff(source.index())).contains("hwcloud-docs");
            int metaCount = countReferencedPages(source);
            ImportFormatApi.Result result = formats.adapt(source.index(), source, sink);
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) result).pack();
            assertThat(pack.pages()).hasSize(metaCount);
            assertThat(metaCount).isEqualTo(257);
            assertThat(pack.info()).extracting(AdaptedPack.Issue::code).contains("unresolved_image");
        }
    }

    private int countReferencedPages(PackSource source) throws Exception {
        java.util.Set<String> uris = new java.util.LinkedHashSet<>();
        for (String name : source.index().names()) {
            if (PackPaths.discarded(name)) continue;
            if (!java.util.Set.of("ALL_META.TXT.json", "CLASS.TXT.json").contains(PackPaths.basename(name))) continue;
            try (InputStream in = source.open(name)) {
                JsonNode root = json.readTree(in.readAllBytes());
                for (JsonNode row : root) {
                    if (row.has("uri") && row.get("uri").isString())
                        uris.add(row.get("uri").asString());
                }
            }
        }
        return uris.size();
    }
}
