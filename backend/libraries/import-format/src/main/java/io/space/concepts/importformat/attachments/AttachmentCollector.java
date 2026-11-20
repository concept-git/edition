package io.space.concepts.importformat.attachments;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.PackFiles;
import io.space.concepts.importformat.archive.PackPaths;
import io.space.concepts.importformat.contract.AdaptSink;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.importformat.contract.PackSource;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/** Deduped attachment puts; logical path is {@code attachments/<basename>}. */
public final class AttachmentCollector {
    private final PackSource source;
    private final AdaptSink sink;
    private final Map<String, String> checksums = new LinkedHashMap<>();
    private final Map<String, String> logicalByZip = new LinkedHashMap<>();
    private final Set<String> logicalUsed = new LinkedHashSet<>();
    private AdaptedPack.Issue fatal;

    public AttachmentCollector(PackSource source, AdaptSink sink) {
        this.source = source;
        this.sink = sink;
    }

    public Map<String, String> checksums() {
        return checksums;
    }

    public void recordChecksum(String path, String hex) {
        checksums.put(path, hex);
    }

    public AdaptedPack.Issue fatal() {
        return fatal;
    }

    public String putZipEntry(String zipName) {
        if (fatal != null) return null;
        String existing = logicalByZip.get(zipName);
        if (existing != null) return existing;
        String logical = uniqueLogical(zipName);
        return putZipEntryAs(zipName, logical);
    }

    public String putZipEntryAs(String zipName, String logical) {
        if (fatal != null) return null;
        String existing = logicalByZip.get(zipName);
        if (existing != null) return existing;
        try (InputStream in = source.open(zipName)) {
            AdaptSink.StoredAttachment stored = sink.putAttachment(logical, in, source.size(zipName));
            checksums.put(logical, stored.sha256());
            logicalByZip.put(zipName, logical);
            logicalUsed.add(logical);
            return logical;
        } catch (AdaptSink.TooLarge tooLarge) {
            fatal = new AdaptedPack.Issue("file_too_large", zipName, null);
            return null;
        } catch (AdaptSink.UnsupportedType unsupported) {
            sink.info("skipped_file", zipName, "unsupported magic");
            return null;
        } catch (IOException io) {
            fatal = new AdaptedPack.Issue("unreadable_entry", zipName, io.getMessage());
            return null;
        }
    }

    public void scanLeftovers(Set<String> consumed) {
        if (fatal != null) return;
        for (String name : source.index().names()) {
            if (consumed.contains(name)) continue;
            if (PackPaths.directory(name) || PackPaths.discarded(name) || source.metadataEntry(name)) continue;
            if (PackPaths.zipSlip(name)) continue;
            if (logicalByZip.containsKey(name)) continue;
            if (PackFiles.page(name)) {
                sink.info("unlisted_page", name, "not in format page list");
                continue;
            }
            if (PackFiles.skipSuffix(name)) {
                sink.info("skipped_file", name, PackPaths.basename(name));
                continue;
            }
            byte[] peek;
            try (var input = source.open(name)) {
                peek = input.readNBytes(16);
            } catch (IOException io) {
                sink.info("skipped_file", name, io.getMessage());
                continue;
            }
            if (AttachmentTypes.sniff(peek) != null) {
                putZipEntry(name);
                if (fatal != null) return;
            } else {
                sink.info("skipped_file", name, "unsupported type");
            }
        }
    }

    private String uniqueLogical(String zipName) {
        String base = PackPaths.basename(zipName);
        String logical = "attachments/" + base;
        int serial = 2;
        while (logicalUsed.contains(logical)) {
            String stem = PackPaths.stripExtension(base);
            int dot = base.lastIndexOf('.');
            String ext = dot > 0 ? base.substring(dot) : "";
            logical = "attachments/" + stem + "-" + serial + ext;
            serial++;
        }
        logicalUsed.add(logical);
        return logical;
    }
}
