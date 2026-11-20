package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.ZipPackSource;
import io.space.concepts.importformat.attachments.AttachmentCollector;
import io.space.concepts.importformat.contract.AdaptSink;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.importformat.contract.ImportFormatAdapter;
import io.space.concepts.importformat.contract.PackIndex;
import io.space.concepts.importformat.contract.PackSource;
import io.space.concepts.importformat.formats.bundle.ManifestBundleAdapter;
import io.space.concepts.importformat.formats.filetree.PlainTreeAdapter;
import io.space.concepts.importformat.formats.ipd.IpdExportAdapter;
import io.space.concepts.importformat.formats.okf.OkfRepoAdapter;
import io.space.concepts.importformat.routing.ImportFormatRegistry;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import tools.jackson.databind.json.JsonMapper;

class ImportFormatRoutingTest {
    @ParameterizedTest
    @ValueSource(strings = {"bundle-v1", "hwcloud-docs", "okf-v0.1", "file-tree"})
    void aFormatCanAdaptWithoutRegisteringAnyOtherFormat(String id) throws Exception {
        var json = JsonMapper.builder().build();
        ImportFormatAdapter adapter =
                switch (id) {
                    case "bundle-v1" -> new ManifestBundleAdapter(json);
                    case "hwcloud-docs" -> new IpdExportAdapter(json);
                    case "okf-v0.1" -> new OkfRepoAdapter();
                    default -> new PlainTreeAdapter();
                };
        var zip =
                switch (id) {
                    case "bundle-v1" -> ImportPacks.zipFixture("F-v1-ok");
                    case "hwcloud-docs" -> ImportPacks.zipFixture("F-hw-mini");
                    case "okf-v0.1" -> ImportPacks.zipFixture("F-okf-mini");
                    default -> ImportPacks.zipEntries(Map.of("README.md", bytes("# Guide")));
                };
        try (var source = new ZipPackSource(zip)) {
            var standaloneSink = new InMemoryAdaptSink();
            var standalone = new ImportFormatRegistry(List.of(adapter)).adapt(source.index(), source, standaloneSink);
            var combinedSink = new InMemoryAdaptSink();
            var combined = StandardImportFormats.create(json).adapt(source.index(), source, combinedSink);
            assertThat(standalone)
                    .isInstanceOf(ImportFormatApi.Result.Adapted.class)
                    .isEqualTo(combined);
            assertThat(standaloneSink.stored()).isEqualTo(combinedSink.stored());
            assertThat(standaloneSink.issues()).isEqualTo(combinedSink.issues());
        }
    }

    @Test
    void eachFormatRecognizesItsOwnMarkersEvenWhenAnotherFormatIsPresent() {
        var index = new PackIndex(
                List.of("manifest.json", "ALL_META.TXT.json", "CLASS.TXT.json", ".okfignore", "README.md"));
        assertThat(new IpdExportAdapter(JsonMapper.builder().build()).sniff(index))
                .isTrue();
        assertThat(new OkfRepoAdapter().sniff(index)).isTrue();
        assertThat(new PlainTreeAdapter().sniff(index)).isTrue();
        assertThat(StandardImportFormats.create(JsonMapper.builder().build()).sniff(index))
                .contains("bundle-v1");
    }

    @Test
    void aRecognizedButInvalidManifestCannotFallBackToPlainDocuments() throws Exception {
        var zip = ImportPacks.zipEntries(Map.of("manifest.json", bytes("{}"), "README.md", bytes("# Valid page")));
        try (var source = new ZipPackSource(zip)) {
            var result = StandardImportFormats.create(JsonMapper.builder().build())
                    .adapt(source.index(), source, new InMemoryAdaptSink());
            assertThat(result)
                    .isInstanceOfSatisfying(
                            ImportFormatApi.Result.Invalid.class,
                            invalid -> assertThat(invalid.adapterId()).isEqualTo("bundle-v1"));
        }
    }

    @Test
    void metadataIsDeclaredByAdaptersAndNeverReadByTheSharedAttachmentScanner() {
        var closed = new AtomicBoolean();
        PackSource source = new PackSource() {
            @Override
            public PackIndex index() {
                return new PackIndex(List.of("custom.metadata"));
            }

            @Override
            public java.io.InputStream open(String name) {
                throw new AssertionError("metadata must not be read as an attachment");
            }

            @Override
            public void close() {
                closed.set(true);
            }
        };
        ImportFormatAdapter format = new ImportFormatAdapter() {
            @Override
            public String id() {
                return "test-format";
            }

            @Override
            public int order() {
                return 0;
            }

            @Override
            public boolean sniff(PackIndex index) {
                return true;
            }

            @Override
            public boolean metadataEntry(String name) {
                return name.equals("custom.metadata");
            }

            @Override
            public Outcome adapt(PackSource pack, AdaptSink sink) {
                new AttachmentCollector(pack, sink).scanLeftovers(Set.of());
                return new Outcome.Adapted(new AdaptedPack(id(), List.of(), List.of(), Map.of(), List.of()));
            }
        };
        var result = new ImportFormatRegistry(List.of(format)).adapt(source.index(), source, new InMemoryAdaptSink());
        assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
        assertThat(closed).isFalse();
    }

    @Test
    void dependencyFailurePropagatesWithoutTryingAnotherFormat() {
        var failure = new IllegalStateException("dependency unavailable");
        ImportFormatAdapter format = new ImportFormatAdapter() {
            @Override
            public String id() {
                return "test-format";
            }

            @Override
            public int order() {
                return -1;
            }

            @Override
            public boolean sniff(PackIndex index) {
                return true;
            }

            @Override
            public Outcome adapt(PackSource source, AdaptSink sink) {
                throw failure;
            }
        };
        PackSource source = new PackSource() {
            @Override
            public PackIndex index() {
                return new PackIndex(List.of("README.md"));
            }

            @Override
            public java.io.InputStream open(String name) {
                throw new AssertionError("must not fall back");
            }
        };
        var registry = new ImportFormatRegistry(List.of(new PlainTreeAdapter(), format));
        assertThatThrownBy(() -> registry.adapt(source.index(), source, new InMemoryAdaptSink()))
                .isSameAs(failure);
    }

    private static byte[] bytes(String value) {
        return value.getBytes(StandardCharsets.UTF_8);
    }
}
