package io.edition.concepts.importformat.routing;

import io.edition.concepts.importformat.api.*;
import io.edition.concepts.importformat.contract.ImportFormatAdapter;
import io.edition.concepts.importformat.contract.PackIndex;
import io.edition.concepts.importformat.contract.PackSource;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** 借用包源，只补充注册格式的元数据归属；关闭底层源的责任仍属于调用方。 */
final class FormatMetadataSource implements PackSource {
    private final PackSource source;
    private final Set<String> metadata;

    FormatMetadataSource(PackSource source, List<ImportFormatAdapter> adapters) {
        this.source = source;
        this.metadata = source.index().names().stream()
                .filter(name -> adapters.stream().anyMatch(adapter -> adapter.metadataEntry(name)))
                .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    public PackIndex index() {
        return source.index();
    }

    @Override
    public InputStream open(String name) throws IOException {
        return source.open(name);
    }

    @Override
    public long size(String name) {
        return source.size(name);
    }

    @Override
    public List<String> zipSlipEntries() {
        return source.zipSlipEntries();
    }

    @Override
    public boolean hasZipSlip() {
        return source.hasZipSlip();
    }

    @Override
    public boolean metadataEntry(String name) {
        return metadata.contains(name) || source.metadataEntry(name);
    }
}
