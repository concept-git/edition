package io.space.concepts.importformat.archive;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.contract.PackIndex;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Resolve a pack-relative path or basename to a zip entry name. */
public final class PackLookup {
    private final Map<String, String> exact = new LinkedHashMap<>();
    private final Map<String, String> byBase = new LinkedHashMap<>();

    private final Set<String> ambiguous = new HashSet<>();
    private final boolean uniqueBasenames;

    public PackLookup(PackIndex index) {
        this(index, false);
    }

    public PackLookup(PackIndex index, boolean uniqueBasenames) {
        this.uniqueBasenames = uniqueBasenames;
        for (String name : index.names()) {
            if (PackPaths.directory(name) || PackPaths.discarded(name) || PackPaths.zipSlip(name)) continue;
            String unix = PackPaths.unix(name);
            exact.put(unix, name);
            String base = PackPaths.basename(unix).toLowerCase(Locale.ROOT);
            if (byBase.putIfAbsent(base, name) != null) ambiguous.add(base);
        }
    }

    public String find(String path) {
        if (path == null || path.isBlank()) return null;
        String unix = PackPaths.unix(path);
        if (unix.startsWith("./")) unix = unix.substring(2);
        String hit = exact.get(unix);
        if (hit != null) return hit;
        String base = PackPaths.basename(unix).toLowerCase(Locale.ROOT);
        return uniqueBasenames && ambiguous.contains(base) ? null : byBase.get(base);
    }

    public static String resolveAgainst(String fromFile, String relative) {
        String rel = PackPaths.unix(relative).trim();
        if (rel.startsWith("./")) rel = rel.substring(2);
        Path base = Path.of(PackPaths.parent(fromFile));
        Path resolved = PackPaths.parent(fromFile).isEmpty() ? Path.of(rel) : base.resolve(rel);
        return PackPaths.unix(resolved.normalize().toString());
    }

    public static boolean externalHref(String href) {
        String lower = href.toLowerCase(Locale.ROOT).strip();
        return lower.startsWith("http://")
                || lower.startsWith("https://")
                || lower.startsWith("mailto:")
                || lower.startsWith("javascript:")
                || lower.startsWith("data:")
                || lower.startsWith("#");
    }

    public static String[] splitFragment(String href) {
        String raw = href.strip();
        int hash = raw.indexOf('#');
        int query = raw.indexOf('?');
        int cut = raw.length();
        if (hash >= 0) cut = Math.min(cut, hash);
        if (query >= 0) cut = Math.min(cut, query);
        return new String[] {raw.substring(0, cut), raw.substring(cut)};
    }
}
