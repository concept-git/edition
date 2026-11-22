package io.edition.control.modules.importformat.archive;

import io.edition.content.DocumentFormat;
import io.edition.control.modules.importformat.api.*;
import io.edition.control.modules.importformat.contract.PackIndex;
import java.util.Locale;
import java.util.Set;

/** 文件类型与索引查询；来源标记由各适配器传入。 */
public final class PackFiles {
    private static final Set<String> SKIP_SUFFIXES =
            Set.of("css", "js", "svg", "ico", "map", "woff", "woff2", "ttf", "eot", "less", "scss", "yml", "yaml");

    private PackFiles() {}

    public static boolean skipSuffix(String name) {
        String base = PackPaths.basename(name).toLowerCase(Locale.ROOT);
        int dot = base.lastIndexOf('.');
        if (dot < 0 || dot == base.length() - 1) return false;
        return SKIP_SUFFIXES.contains(base.substring(dot + 1));
    }

    public static boolean markdown(String name) {
        return DocumentFormat.fromFileName(PackPaths.basename(name)).orElse(null) == DocumentFormat.MARKDOWN;
    }

    public static boolean html(String name) {
        return DocumentFormat.fromFileName(PackPaths.basename(name)).orElse(null) == DocumentFormat.HTML;
    }

    public static boolean page(String name) {
        return DocumentFormat.fromFileName(PackPaths.basename(name)).isPresent();
    }

    public static boolean hasBasename(PackIndex index, String basename) {
        for (String name : index.names()) {
            if (PackPaths.discarded(name) || PackPaths.directory(name) || PackPaths.zipSlip(name)) continue;
            if (PackPaths.basename(name).equals(basename)) return true;
        }
        return false;
    }
}
