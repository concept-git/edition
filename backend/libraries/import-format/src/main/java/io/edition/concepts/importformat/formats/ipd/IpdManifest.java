package io.edition.concepts.importformat.formats.ipd;

import io.edition.concepts.importformat.api.*;
import io.edition.concepts.importformat.archive.PackFiles;
import io.edition.concepts.importformat.archive.PackPaths;
import io.edition.concepts.importformat.contract.AdaptSink;
import io.edition.concepts.importformat.contract.AdaptedPack;
import io.edition.concepts.importformat.contract.ImportLimits;
import io.edition.concepts.importformat.contract.PackIndex;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import tools.jackson.databind.JsonNode;

/** Validated IPD manifest: file identities are independent of directory node codes. */
final class IpdManifest {
    private static final Set<String> PAGE_FIELDS = Set.of("uri", "code", "title", "des", "kw");
    final Map<String, PageSource> pages = new LinkedHashMap<>();
    private final Map<String, Node> nodes = new LinkedHashMap<>();
    private final Map<String, List<Node>> children = new LinkedHashMap<>();
    private final Map<String, String> exact = new LinkedHashMap<>();
    private final Map<String, List<String>> byBase = new LinkedHashMap<>();

    private IpdManifest(PackIndex index) {
        for (String name : index.names()) {
            if (PackPaths.directory(name) || PackPaths.discarded(name) || PackPaths.zipSlip(name)) continue;
            if (!PackFiles.html(name)) continue;
            exact.put(PackPaths.unix(name), name);
            byBase.computeIfAbsent(base(name), ignored -> new ArrayList<>()).add(name);
        }
    }

    static IpdManifest parse(JsonNode meta, JsonNode klass, PackIndex index, AdaptSink sink) {
        IpdManifest manifest = new IpdManifest(index);
        manifest.readMeta(meta, sink);
        manifest.readClass(klass);
        manifest.validateTree();
        if (manifest.pages.isEmpty()) throw invalid("empty_ipd_pack", "ALL_META/CLASS", "no importable pages");
        if (manifest.pages.size() > ImportLimits.MAX_PAGE_FILES) {
            throw invalid("too_many_files", "ALL_META/CLASS", Integer.toString(manifest.pages.size()));
        }
        return manifest;
    }

    private void readMeta(JsonNode rows, AdaptSink sink) {
        int index = 0;
        for (JsonNode row : rows) {
            String field = "ALL_META[" + index++ + "]";
            if (!row.isObject() || !row.has("uri")) {
                sink.info("metadata_record_ignored", field, "record without uri");
                continue;
            }
            for (String key : List.of("des", "kw")) {
                JsonNode value = row.get(key);
                if (value != null && !value.isNull() && seoText(value) == null) {
                    sink.info("seo_field_ignored", field + "." + key, "empty or invalid optional SEO field");
                }
            }
            String path = resolve(row.get("uri"), field + ".uri");
            Meta meta = metadata(row);
            PageSource page = pages.computeIfAbsent(path, PageSource::new);
            if (page.meta != null && !page.meta.equals(meta)) {
                throw invalid("invalid_manifest", field, "conflicting metadata: " + path);
            }
            page.meta = meta;
        }
    }

    private void readClass(JsonNode rows) {
        int index = 0;
        for (JsonNode row : rows) {
            String field = "CLASS[" + index++ + "]";
            if (!row.isObject()) throw invalid("invalid_manifest", field, "expected directory node");
            String code = identifier(row.get("code"), field + ".code");
            if (code.isEmpty()) throw invalid("invalid_manifest", field + ".code", "missing code");
            String parent = identifier(row.get("p_code"), field + ".p_code");
            String path = row.has("uri") ? resolve(row.get("uri"), field + ".uri") : null;
            String title = optionalText(row.get("title"));
            if (title != null) checkedTitle(title, field + ".title");
            Node node = new Node(code, parent, path, title, field);
            if (nodes.putIfAbsent(code, node) != null) {
                throw invalid("invalid_manifest", field + ".code", "duplicate code: " + code);
            }
            children.computeIfAbsent(parent, ignored -> new ArrayList<>()).add(node);
            if (path != null) {
                PageSource page = pages.computeIfAbsent(path, PageSource::new);
                if (page.classTitle == null) page.classTitle = title;
            }
        }
    }

    private void validateTree() {
        for (Node node : nodes.values()) {
            Set<String> seen = new LinkedHashSet<>();
            Node current = node;
            while (current != null) {
                if (!seen.add(current.code)) {
                    throw invalid("invalid_manifest", current.field + ".code", "cycle: " + current.code);
                }
                if (seen.size() > ImportLimits.MAX_TOC_DEPTH) {
                    throw invalid("toc_depth_exceeded", node.field, Integer.toString(seen.size()));
                }
                if (current.parent.isEmpty()) break;
                Node parent = nodes.get(current.parent);
                if (parent == null) {
                    throw invalid("invalid_manifest", current.field + ".p_code", "missing parent: " + current.parent);
                }
                current = parent;
            }
        }
    }

    List<AdaptedPack.TocNode> toc(Map<String, String> titles) {
        return walk("", titles);
    }

    private List<AdaptedPack.TocNode> walk(String parent, Map<String, String> titles) {
        List<AdaptedPack.TocNode> result = new ArrayList<>();
        // validateTree guarantees a rooted acyclic graph of depth <= MAX_TOC_DEPTH.
        for (Node node : children.getOrDefault(parent, List.of())) {
            String label = node.title;
            if (label == null) label = node.path == null ? node.code : titles.get(node.path);
            checkedTitle(label, node.field + ".title");
            result.add(new AdaptedPack.TocNode(
                    label,
                    node.path == null ? "group" : "target",
                    node.path == null ? null : PackPaths.unix(node.path),
                    null,
                    walk(node.code, titles)));
        }
        return result;
    }

    private String resolve(JsonNode uri, String field) {
        String value = optionalText(uri);
        if (value == null) throw invalid("invalid_manifest", field, "uri must be a non-empty string");
        String path = PackPaths.unix(value);
        while (path.startsWith("./")) path = path.substring(2);
        if (PackPaths.zipSlip(path) || path.matches("^[A-Za-z][A-Za-z0-9+.-]*:.*") || !PackFiles.html(path)) {
            throw invalid("invalid_manifest", field, "expected package-relative HTML path: " + value);
        }
        String hit = exact.get(path);
        if (hit != null) return hit;
        List<String> candidates = byBase.getOrDefault(base(path), List.of());
        if (candidates.size() != 1) {
            throw invalid(
                    "invalid_manifest", field, (candidates.isEmpty() ? "missing html: " : "ambiguous html: ") + value);
        }
        return candidates.getFirst();
    }

    private static Meta metadata(JsonNode row) {
        Map<String, JsonNode> properties = new LinkedHashMap<>();
        for (var entry : row.properties()) {
            if (!PAGE_FIELDS.contains(entry.getKey())) properties.put(entry.getKey(), entry.getValue());
        }
        return new Meta(optionalText(row.get("title")), seoText(row.get("des")), seoText(row.get("kw")), properties);
    }

    private static String seoText(JsonNode value) {
        String text = optionalText(value);
        return text != null && text.codePointCount(0, text.length()) <= 500 ? text : null;
    }

    static String optionalText(JsonNode value) {
        if (value == null || !value.isString()) return null;
        String text = value.asString().strip();
        return text.isEmpty() ? null : text;
    }

    static String checkedTitle(String title, String field) {
        if (title == null || title.isBlank() || title.codePointCount(0, title.length()) > 200) {
            throw invalid("invalid_manifest", field, "title must contain 1–200 characters");
        }
        return title;
    }

    private static String identifier(JsonNode value, String field) {
        if (value == null || value.isNull()) return "";
        if (!value.isString() && !value.isNumber()) {
            throw invalid("invalid_manifest", field, "identifier must be a string or number");
        }
        return value.asString().strip();
    }

    private static String base(String path) {
        return PackPaths.basename(path).toLowerCase(Locale.ROOT);
    }

    private static Invalid invalid(String code, String path, String detail) {
        return new Invalid(new AdaptedPack.Issue(code, path, detail));
    }

    static final class Invalid extends IllegalArgumentException {
        final AdaptedPack.Issue issue;

        Invalid(AdaptedPack.Issue issue) {
            super(issue.detail());
            this.issue = issue;
        }
    }

    static final class PageSource {
        final String path;
        Meta meta;
        String classTitle;

        PageSource(String path) {
            this.path = path;
        }
    }

    record Meta(String title, String description, String keywords, Map<String, JsonNode> properties) {}

    private record Node(String code, String parent, String path, String title, String field) {}
}
