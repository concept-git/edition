package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.ZipPackSource;
import io.space.concepts.importformat.contract.AdaptedPack;
import java.nio.file.Path;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import tools.jackson.databind.json.JsonMapper;

class OkfGithubPackTest {
    private final ImportFormatApi formats = io.space.concepts.importformat.StandardImportFormats.create(
            JsonMapper.builder().build());

    static boolean githubZipPresent() {
        return ImportPacks.okfGithubZip() != null;
    }

    @Test
    @Tag("slow")
    @EnabledIf("githubZipPresent")
    void sniffsOkfAndAdaptsTypedMarkdownPages() throws Exception {
        Path zip = ImportPacks.okfGithubZip();
        InMemoryAdaptSink sink = new InMemoryAdaptSink();
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(formats.sniff(source.index())).contains("okf-v0.1");
            ImportFormatApi.Result result = formats.adapt(source.index(), source, sink);
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            AdaptedPack pack = ((ImportFormatApi.Result.Adapted) result).pack();
            assertThat(pack.generator()).isEqualTo("okf-v0.1");
            assertThat(pack.pages()).isNotEmpty();
            assertThat(pack.pages()).allMatch(page -> "markdown".equals(page.format()));
            assertThat(pack.pages()).anyMatch(page -> page.properties().containsKey("okf_type"));
        }
    }
}
