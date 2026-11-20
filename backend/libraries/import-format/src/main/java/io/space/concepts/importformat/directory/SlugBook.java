package io.space.concepts.importformat.directory;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.PackPaths;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/** 每个导入包独立分配名称；只记录占用，不持有跨作业业务状态。 */
public final class SlugBook {
    private final Set<String> used = new HashSet<>();

    public String unique(String base) {
        if (used.add(base)) return base;
        int serial = 2;
        String candidate = base + "-" + serial;
        while (!used.add(candidate)) {
            serial++;
            candidate = base + "-" + serial;
        }
        return candidate;
    }

    public static String lowerFilename(String zipName) {
        return PackPaths.stripExtension(zipName).toLowerCase(Locale.ROOT);
    }

    public static String kebabFilename(String zipName) {
        String raw = PackPaths.stripExtension(zipName).toLowerCase(Locale.ROOT);
        String kebab = raw.replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        return kebab.isEmpty() ? "page" : kebab;
    }

    /**
     * 整条相对路径 → 扁平 slug（Space slug 不含 {@code /}）：各段 NFKC 小写、剥段首数字序号（{@code 01-}）、
     * 非 Unicode 字母数字折成单个 {@code -}，再以 {@code -} 连接；{@code index}/{@code readme} 基名代表所在目录；
     * 超过 {@value #MAX_SLUG_CODE_POINTS} code points 截断。
     */
    public static String kebabPath(String zipName) {
        String unix = PackPaths.unix(zipName);
        String[] parts = unix.split("/");
        List<String> segments = new ArrayList<>();
        for (int i = 0; i < parts.length; i++) {
            String part = i == parts.length - 1 ? PackPaths.stripExtension(parts[i]) : parts[i];
            boolean last = i == parts.length - 1;
            if (last && parts.length > 1 && isIndexName(part)) continue;
            String segment = kebabSegment(stripOrderPrefix(part));
            if (!segment.isEmpty()) segments.add(segment);
        }
        String joined = String.join("-", segments);
        if (joined.isEmpty()) joined = "page";
        if (joined.codePointCount(0, joined.length()) > MAX_SLUG_CODE_POINTS) {
            joined = joined.substring(0, joined.offsetByCodePoints(0, MAX_SLUG_CODE_POINTS))
                    .replaceAll("-+$", "");
        }
        return joined.isEmpty() ? "page" : joined;
    }

    public static boolean isIndexName(String stem) {
        String lower = stem.toLowerCase(Locale.ROOT);
        return lower.equals("index") || lower.equals("readme");
    }

    /** 去掉 {@code 01-}、{@code 2.}、{@code 03_} 一类的排序前缀；纯数字名保留。 */
    public static String stripOrderPrefix(String stem) {
        String stripped = ORDER_PREFIX.matcher(stem).replaceFirst("");
        return stripped.isEmpty() ? stem : stripped;
    }

    private static String kebabSegment(String raw) {
        String normalized = Normalizer.normalize(raw, Normalizer.Form.NFKC).toLowerCase(Locale.ROOT);
        return NON_ALNUM.matcher(normalized).replaceAll("-").replaceAll("^-+|-+$", "");
    }

    private static final int MAX_SLUG_CODE_POINTS = 80;
    private static final Pattern ORDER_PREFIX = Pattern.compile("^\\d+[-_.\\s]+");
    private static final Pattern NON_ALNUM = Pattern.compile("[^\\p{L}\\p{N}]+");
}
