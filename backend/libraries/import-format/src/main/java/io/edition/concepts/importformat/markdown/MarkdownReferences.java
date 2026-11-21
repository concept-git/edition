package io.edition.concepts.importformat.markdown;

import io.edition.concepts.importformat.api.*;
import io.edition.concepts.importformat.archive.PackLookup;
import io.edition.concepts.importformat.archive.PackPaths;
import io.edition.concepts.importformat.attachments.AttachmentCollector;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** 从原始 Markdown 收集本地附件引用，保留正文拼写，不自行决定页面与格式规则。 */
public final class MarkdownReferences {
    private static final Pattern LINK = Pattern.compile("(!?\\[[^\\]]*\\]\\()([^)]+)(\\))");

    private MarkdownReferences() {}

    /** Preserve source spelling while collecting attachments for a path-preserving format. */
    public static void collectReferences(
            String markdown,
            String from,
            PackLookup lookup,
            AttachmentCollector attachments,
            java.util.Set<String> pages,
            List<String> pageAttachments) {
        Matcher matcher = LINK.matcher(markdown);
        while (matcher.find()) {
            String url = matcher.group(2).trim();
            if (url.isBlank() || PackLookup.externalHref(url)) continue;
            String resolved = PackLookup.resolveAgainst(from, PackLookup.splitFragment(url)[0]);
            if (pages.contains(resolved)) continue;
            String zip = lookup.find(resolved);
            if (zip == null) continue;
            String stored = attachments.putZipEntryAs(zip, PackPaths.unix(zip));
            if (stored != null && !pageAttachments.contains(stored)) pageAttachments.add(stored);
        }
    }
}
