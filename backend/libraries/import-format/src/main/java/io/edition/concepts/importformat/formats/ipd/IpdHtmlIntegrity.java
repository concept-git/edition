package io.edition.concepts.importformat.formats.ipd;

import io.edition.concepts.importformat.api.*;
import io.edition.concepts.importformat.archive.PackFiles;
import io.edition.concepts.importformat.archive.PackLookup;
import io.edition.concepts.importformat.attachments.AttachmentTypes;
import io.edition.concepts.importformat.contract.AdaptSink;
import io.edition.concepts.importformat.contract.AdaptedPack;
import io.edition.concepts.importformat.contract.PackSource;
import java.io.IOException;
import java.util.Set;
import org.jsoup.nodes.Document;

/** Validate original HTML references without modifying the document. */
final class IpdHtmlIntegrity {
    private IpdHtmlIntegrity() {}

    static void check(
            Document doc, String from, PackSource source, PackLookup lookup, Set<String> pages, AdaptSink sink)
            throws IOException {
        for (String attr : new String[] {"href", "src"}) {
            for (var element : doc.body().select(attr.equals("href") ? "a[href]" : "img[src]")) {
                String value = element.attr(attr).strip();
                if (value.isEmpty()
                        || value.startsWith("#")
                        || value.startsWith("//")
                        || value.matches("^[A-Za-z][A-Za-z0-9+.-]*:.*")) continue;
                String path = PackLookup.splitFragment(value)[0];
                if (path.isEmpty()) continue;
                String zip = lookup.find(PackLookup.resolveAgainst(from, path));
                if (zip == null) zip = lookup.find(path);
                if (zip == null) {
                    if (attr.equals("src")) {
                        sink.info("unresolved_image", from, value);
                        continue;
                    }
                    throw invalid(from, value, "missing or ambiguous local reference");
                }
                if (PackFiles.html(zip)) {
                    if (!pages.contains(zip)) throw invalid(from, value, "target page is not in the manifest");
                } else {
                    try (var in = source.open(zip)) {
                        if (AttachmentTypes.sniff(in.readNBytes(16)) == null) {
                            if (attr.equals("src")) sink.info("unsupported_image", from, value);
                            else throw invalid(from, value, "unsupported referenced attachment");
                        }
                    }
                }
            }
        }
    }

    private static IpdManifest.Invalid invalid(String from, String href, String detail) {
        return new IpdManifest.Invalid(new AdaptedPack.Issue("broken_local_reference", from, detail + ": " + href));
    }
}
