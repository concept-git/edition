package io.space.concepts.importformat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.contract.ImportFormatAdapter;
import io.space.concepts.importformat.formats.bundle.ManifestBundleAdapter;
import io.space.concepts.importformat.formats.filetree.PlainTreeAdapter;
import io.space.concepts.importformat.formats.ipd.IpdExportAdapter;
import io.space.concepts.importformat.formats.okf.OkfRepoAdapter;
import io.space.concepts.importformat.routing.ImportFormatRegistry;
import java.util.List;
import tools.jackson.databind.json.JsonMapper;

/** Test/fixture factory. Production uses Spring-injected {@link ImportFormatAdapter} beans. */
public final class StandardImportFormats {
    private StandardImportFormats() {}

    public static ImportFormatRegistry create(JsonMapper json) {
        return new ImportFormatRegistry(List.of(
                new ManifestBundleAdapter(json),
                new IpdExportAdapter(json),
                new OkfRepoAdapter(),
                new PlainTreeAdapter()));
    }
}
