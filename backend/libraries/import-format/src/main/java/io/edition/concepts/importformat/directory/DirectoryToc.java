package io.edition.concepts.importformat.directory;

import io.edition.concepts.importformat.api.*;
import io.edition.concepts.importformat.archive.PackPaths;
import io.edition.concepts.importformat.contract.AdaptedPack;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * 目录树 → Toc：目录成 group、页成 target。{@code okf-v0.1} 与 {@code file-tree} 共用。
 *
 * <p>同目录内页按 {@link Page#order()} 排序、再列子目录（按名）。根目录（{@code ""}）不生成 group：
 * 根页直接是顶层 target；没有根页时顶层就是各一级目录的 group。
 */
public final class DirectoryToc {
    private DirectoryToc() {}

    /** 一页在目录树中的位置；{@code dir} 为 unix 风格父目录，根为空串。 */
    public record Page(String dir, String externalId, String title, String order) {}

    /** 与 {@link #build} 相同的深度优先顺序，供适配器给页面编号。 */
    public static List<Page> depthFirst(Collection<Page> pages, Map<String, String> labels) {
        Tree tree = new Tree(pages, labels);
        List<Page> out = new ArrayList<>(tree.pagesIn(""));
        for (String top : tree.topLevelDirs()) collect(tree, top, out);
        return out;
    }

    public static List<AdaptedPack.TocNode> build(Collection<Page> pages, Map<String, String> labels) {
        Tree tree = new Tree(pages, labels);
        List<AdaptedPack.TocNode> nodes = new ArrayList<>();
        for (Page page : tree.pagesIn("")) nodes.add(target(page));
        for (String top : tree.topLevelDirs()) nodes.add(group(tree, top));
        return nodes;
    }

    private static void collect(Tree tree, String dir, List<Page> out) {
        out.addAll(tree.pagesIn(dir));
        for (String child : tree.childDirs(dir)) collect(tree, child, out);
    }

    private static AdaptedPack.TocNode group(Tree tree, String dir) {
        List<AdaptedPack.TocNode> children = new ArrayList<>();
        for (Page page : tree.pagesIn(dir)) children.add(target(page));
        for (String child : tree.childDirs(dir)) children.add(group(tree, child));
        return new AdaptedPack.TocNode(tree.label(dir), "group", null, null, children);
    }

    private static AdaptedPack.TocNode target(Page page) {
        return new AdaptedPack.TocNode(page.title(), "target", page.externalId(), null, List.of());
    }

    /** 目录名 → 分组名：去排序前缀、分隔符转空格、ASCII 单词首字母大写（{@code 02-api-guides} → {@code Api Guides}）。 */
    static String folderLabel(String dir) {
        String base = PackPaths.basename(dir);
        if (base.isBlank()) return dir;
        String spaced = SlugBook.stripOrderPrefix(base)
                .replace('-', ' ')
                .replace('_', ' ')
                .strip();
        if (spaced.isEmpty()) spaced = base;
        StringBuilder out = new StringBuilder(spaced.length());
        boolean wordStart = true;
        for (int i = 0; i < spaced.length(); i++) {
            char c = spaced.charAt(i);
            out.append(wordStart && c >= 'a' && c <= 'z' ? Character.toUpperCase(c) : c);
            wordStart = c == ' ';
        }
        return out.toString();
    }

    private static final class Tree {
        private final Map<String, List<Page>> pagesByDir = new TreeMap<>();
        private final Set<String> dirs = new LinkedHashSet<>();
        private final Map<String, String> labels;

        Tree(Collection<Page> pages, Map<String, String> labels) {
            this.labels = labels;
            for (Page page : pages) {
                pagesByDir.computeIfAbsent(page.dir(), key -> new ArrayList<>()).add(page);
                addAncestors(page.dir());
            }
            for (String dir : labels.keySet()) addAncestors(dir);
            for (List<Page> here : pagesByDir.values()) {
                here.sort((left, right) -> left.order().compareTo(right.order()));
            }
        }

        private void addAncestors(String dir) {
            String current = dir;
            while (current != null && !current.isEmpty()) {
                dirs.add(current);
                current = PackPaths.parent(current);
            }
        }

        List<Page> pagesIn(String dir) {
            return pagesByDir.getOrDefault(dir, List.of());
        }

        List<String> childDirs(String dir) {
            List<String> children = new ArrayList<>();
            for (String candidate : dirs) {
                if (PackPaths.parent(candidate).equals(dir) && !candidate.equals(dir)) children.add(candidate);
            }
            children.sort(String::compareTo);
            return children;
        }

        List<String> topLevelDirs() {
            return childDirs("");
        }

        String label(String dir) {
            String label = labels.get(dir);
            return label == null || label.isBlank() ? folderLabel(dir) : label;
        }
    }
}
