package io.edition.control.modules.importformat.attachments;

import io.edition.control.modules.importformat.api.*;
import io.edition.control.modules.importformat.archive.PackFiles;
import io.edition.control.modules.importformat.archive.PackLookup;
import java.util.ArrayList;
import java.util.List;
import org.jsoup.nodes.Document;

/** Collect referenced files without rewriting or serializing the uploaded HTML. */
public final class HtmlAttachments {
    private HtmlAttachments() {}

    public static List<String> collect(
            Document document, String from, PackLookup lookup, AttachmentCollector attachments) {
        return collect(document, from, lookup, attachments::putZipEntry);
    }

    public static List<String> collect(
            Document document, String from, PackLookup lookup, java.util.function.Function<String, String> store) {
        List<String> paths = new ArrayList<>();
        for (var element : document.select("a[href], img[src]")) {
            String value = element.attr(element.hasAttr("href") ? "href" : "src");
            if (value.isBlank() || PackLookup.externalHref(value) || value.startsWith("//")) continue;
            String path = PackLookup.splitFragment(value)[0];
            if (path.isBlank()) continue;
            String zip = lookup.find(PackLookup.resolveAgainst(from, path));
            if (zip == null) zip = lookup.find(path);
            if (zip == null || PackFiles.html(zip) || PackFiles.markdown(zip)) continue;
            String logical = store.apply(zip);
            if (logical != null && !paths.contains(logical)) paths.add(logical);
        }
        return paths;
    }
}
