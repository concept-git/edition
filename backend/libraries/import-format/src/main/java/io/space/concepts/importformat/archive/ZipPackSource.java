package io.space.concepts.importformat.archive;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.contract.PackIndex;
import io.space.concepts.importformat.contract.PackSource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/** ZipFile 支撑的 {@link PackSource}；含 {@code ..} 或绝对路径的条目视为 zip-slip。 */
public final class ZipPackSource implements PackSource {
    private final ZipFile zip;
    private final PackIndex index;
    private final List<String> slip;
    private final String prefix;

    public ZipPackSource(Path path) throws IOException {
        this(new ZipFile(path.toFile(), StandardCharsets.UTF_8));
    }

    public ZipPackSource(ZipFile zip) {
        this.zip = zip;
        List<String> stored = new ArrayList<>();
        Enumeration<? extends ZipEntry> entries = zip.entries();
        while (entries.hasMoreElements()) {
            stored.add(entries.nextElement().getName());
        }
        this.prefix = PackPaths.wrapperPrefix(stored);
        List<String> names = new ArrayList<>();
        List<String> slipped = new ArrayList<>();
        for (String name : stored) {
            if (PackPaths.zipSlip(name)) slipped.add(name);
            String logical = PackPaths.stripWrapper(name, prefix);
            if (logical.isEmpty()) continue;
            names.add(logical);
        }
        this.index = new PackIndex(names);
        this.slip = List.copyOf(slipped);
    }

    private String stored(String logical) {
        if (prefix == null || prefix.isEmpty()) return logical;
        return prefix + logical;
    }

    @Override
    public PackIndex index() {
        return index;
    }

    @Override
    public List<String> zipSlipEntries() {
        return slip;
    }

    @Override
    public long size(String name) {
        ZipEntry entry = zip.getEntry(stored(name));
        if (entry == null) entry = zip.getEntry(name);
        return entry == null ? -1 : entry.getSize();
    }

    @Override
    public InputStream open(String name) throws IOException {
        if (PackPaths.zipSlip(name) || PackPaths.zipSlip(stored(name))) throw new ZipSlipException(name);
        ZipEntry entry = zip.getEntry(stored(name));
        if (entry == null) entry = zip.getEntry(name);
        if (entry == null) throw new java.io.FileNotFoundException(name);
        return zip.getInputStream(entry);
    }

    @Override
    public void close() throws IOException {
        zip.close();
    }

    public static final class ZipSlipException extends RuntimeException {
        public ZipSlipException(String name) {
            super(name);
        }
    }
}
