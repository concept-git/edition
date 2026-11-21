package io.edition.concepts.release.domain;

import io.edition.concepts.release.api.*;
import io.edition.concepts.release.api.ContentHash;
import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.release.api.ReleaseApi.Issue;
import io.edition.concepts.release.api.ReleaseApi.PageSnapshot;
import io.edition.concepts.release.api.ReleaseApi.Report;
import io.edition.concepts.release.api.ReleaseApi.TocNode;
import io.edition.content.DocumentFormat;
import io.edition.content.ResourcePath;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Bundle v1 内禀规则：load 阻断 vs validate 阻断/提示。覆盖清单不在此计算。 */
public final class BundleRules {
    private static final Pattern MARKDOWN_LINK = Pattern.compile("\\[[^\\]]*\\]\\(([^)]+)\\)");
    private static final Pattern HTML_HREF = Pattern.compile("(?is)<a\\b[^>]*?\\bhref\\s*=\\s*['\"]([^'\"]+)['\"]");
    private static final Set<String> SUPPORTED_MAJORS = Set.of("1", "1.0");

    private BundleRules() {}

    public static Report loadIssues(ReleaseApi.Bundle bundle) {
        List<Issue> errors = new ArrayList<>();
        if (bundle.bundleVersion() == null || !supportedMajor(bundle.bundleVersion())) {
            errors.add(issue("unsupported_bundle_version", null, null, bundle.bundleVersion()));
        }
        if (bundle.generator() == null || bundle.generator().isBlank()) {
            errors.add(issue("invalid_manifest", "generator", null, "required"));
        }
        Set<UUID> pageIds = new HashSet<>();
        for (PageSnapshot page : bundle.pages()) {
            if (!pageIds.add(page.pageId())) {
                errors.add(issue("duplicate_page_id", "pages[].pageId", page.pageId(), null));
            }
            String path = contentPath(page);
            byte[] bytes = page.content().getBytes(StandardCharsets.UTF_8);
            if (bytes.length > ReleaseApi.MAX_CONTENT_BYTES) {
                errors.add(issue("content_too_large", path, page.pageId(), null));
            }
            String expected = bundle.checksums().get(path);
            String actual = ContentHash.checksum(page.content());
            if (expected == null || !actual.equalsIgnoreCase(normalizeChecksum(expected))) {
                errors.add(issue("checksum_mismatch", path, page.pageId(), actual));
            }
            for (var attachment : page.attachments()) {
                String listed = bundle.checksums().get(attachment.path());
                String hex = ContentHash.stripPrefix(attachment.sha256());
                if (listed == null || !hex.equalsIgnoreCase(ContentHash.stripPrefix(listed))) {
                    errors.add(issue("checksum_mismatch", attachment.path(), page.pageId(), attachment.sha256()));
                }
            }
        }
        return new Report(errors, List.of(), List.of());
    }

    public static Report validateIssues(ReleaseApi.Bundle bundle) {
        List<Issue> errors = new ArrayList<>();
        List<Issue> info = new ArrayList<>();
        Set<String> externalIds = new HashSet<>();
        Set<String> slugs = new HashSet<>();
        Set<String> referencedAttachments = new HashSet<>();
        Set<String> attachmentPaths = new HashSet<>();
        Map<String, String> resourceFiles = new HashMap<>();
        for (PageSnapshot page : bundle.pages()) {
            if (page.externalId() != null && !externalIds.add(page.externalId())) {
                errors.add(issue("slug_conflict", page.externalId(), page.pageId(), "externalId"));
            }
            if (!slugs.add(page.slug())) {
                errors.add(issue("slug_conflict", page.slug(), page.pageId(), null));
            }
            resourcePath(page.slug(), "page:" + page.pageId(), page.pageId(), resourceFiles, errors);
            if (page.seo() == null
                    || page.seo().description() == null
                    || page.seo().description().isBlank()) {
                info.add(issue("seo_description_missing", contentPath(page), page.pageId(), null));
            }
            for (var attachment : page.attachments()) {
                attachmentPaths.add(attachment.path());
                resourcePath(
                        attachment.path(),
                        ContentHash.stripPrefix(attachment.sha256()),
                        page.pageId(),
                        resourceFiles,
                        errors);
            }
        }
        for (String path : resourceFiles.keySet()) {
            for (int slash = path.indexOf('/'); slash >= 0; slash = path.indexOf('/', slash + 1)) {
                if (resourceFiles.containsKey(path.substring(0, slash))) {
                    errors.add(issue("slug_conflict", path, null, "file_directory_conflict"));
                    break;
                }
            }
        }
        walkToc(bundle.toc(), 1, externalIds, errors);
        Set<String> targets = new HashSet<>(slugs);
        targets.addAll(attachmentPaths);
        for (PageSnapshot page : bundle.pages()) {
            if (page.externalId() != null) {
                targets.add(page.externalId());
                targets.add(page.externalId() + "."
                        + DocumentFormat.valueOf(page.format().name()).extension());
                if (page.format() == ReleaseApi.Format.HTML) targets.add(page.externalId() + ".htm");
            }
        }
        for (PageSnapshot page : bundle.pages()) {
            boolean html = DocumentFormat.valueOf(page.format().name()).bodyKind() == DocumentFormat.BodyKind.HTML;
            // HTML 保留来源相对链接；规范资源路径只用于公开寻址，不作为原文解析起点。
            String from = html && page.externalId() != null ? page.externalId() : page.slug();
            for (String href : links(page)) {
                if (external(href)) continue;
                if (html && (href.startsWith("//") || href.matches("^[A-Za-z][A-Za-z0-9+.-]*:.*"))) continue;
                String raw = strip(href);
                if (raw.isEmpty()) continue;
                String resolved = resolveAgainst(from, raw);
                // Original HTML retains source-relative attachment URLs; the attachment manifest stays canonical.
                if (html) {
                    List<String> matches = attachmentPaths.stream()
                            .filter(path -> path.substring(path.lastIndexOf('/') + 1)
                                    .equals(raw.substring(raw.lastIndexOf('/') + 1)))
                            .toList();
                    if (matches.size() == 1) {
                        referencedAttachments.add(matches.getFirst());
                        continue;
                    }
                }
                if (attachmentPaths.contains(raw) || attachmentPaths.contains(resolved)) {
                    referencedAttachments.add(attachmentPaths.contains(raw) ? raw : resolved);
                }
                if (targets.contains(raw)
                        || targets.contains(resolved)
                        || slugs.contains(basename(raw))
                        || slugs.contains(basename(resolved))
                        || attachmentPaths.contains(raw)
                        || attachmentPaths.contains(resolved)) {
                    continue;
                }
                errors.add(issue("broken_link", href, page.pageId(), from));
            }
        }
        for (String path : attachmentPaths) {
            if (!referencedAttachments.contains(path)) {
                info.add(issue("unused_attachment", path, null, null));
            }
        }
        return new Report(errors, List.of(), info);
    }

    private static void resourcePath(
            String path, String identity, UUID page, Map<String, String> files, List<Issue> errors) {
        try {
            new ResourcePath(path);
        } catch (IllegalArgumentException invalid) {
            errors.add(issue("invalid_manifest", path, page, "invalid_resource_path"));
            return;
        }
        String previous = files.putIfAbsent(path, identity);
        if (previous != null && !previous.equals(identity)) errors.add(issue("slug_conflict", path, page, null));
    }

    public static String contentPath(PageSnapshot page) {
        return ReleaseApi.contentPath(page);
    }

    private static void walkToc(List<TocNode> nodes, int depth, Set<String> externalIds, List<Issue> errors) {
        if (depth > ReleaseApi.MAX_TOC_DEPTH && !nodes.isEmpty()) {
            errors.add(issue("toc_depth_exceeded", null, null, Integer.toString(depth)));
        }
        for (TocNode node : nodes) {
            switch (node.kind()) {
                case TARGET -> {
                    if (node.ref() == null || node.ref().isBlank()) {
                        errors.add(issue("kind_mismatch", node.label(), null, "target"));
                    } else if (!externalIds.contains(node.ref())) {
                        errors.add(issue("missing_toc_target", node.ref(), null, node.label()));
                    }
                    if (node.url() != null && !node.url().isBlank()) {
                        errors.add(issue("kind_mismatch", node.label(), null, "target-url"));
                    }
                }
                case LINK -> {
                    if (node.url() == null || node.url().isBlank()) {
                        errors.add(issue("kind_mismatch", node.label(), null, "link"));
                    }
                    if (node.ref() != null && !node.ref().isBlank()) {
                        errors.add(issue("kind_mismatch", node.label(), null, "link-ref"));
                    }
                }
                case GROUP -> {
                    if ((node.ref() != null && !node.ref().isBlank())
                            || (node.url() != null && !node.url().isBlank())) {
                        errors.add(issue("kind_mismatch", node.label(), null, "group"));
                    }
                }
            }
            walkToc(node.children(), depth + 1, externalIds, errors);
        }
    }

    private static List<String> links(PageSnapshot page) {
        return switch (DocumentFormat.valueOf(page.format().name()).bodyKind()) {
            case MARKDOWN -> matches(MARKDOWN_LINK.matcher(page.content()));
            case HTML ->
                matches(HTML_HREF.matcher(
                        page.content().replaceAll("(?is)<!--.*?-->|<script\\b[^>]*>.*?</script\\s*>", "")));
            case SOURCE -> List.of();
        };
    }

    private static List<String> matches(Matcher matcher) {
        List<String> hrefs = new ArrayList<>();
        while (matcher.find()) hrefs.add(matcher.group(1).trim());
        return hrefs;
    }

    private static boolean external(String href) {
        String lower = href.toLowerCase(Locale.ROOT);
        return lower.startsWith("http://")
                || lower.startsWith("https://")
                || lower.startsWith("mailto:")
                || lower.startsWith("#")
                || lower.startsWith("data:");
    }

    private static String strip(String href) {
        int cut = href.indexOf('#');
        if (cut >= 0) href = href.substring(0, cut);
        cut = href.indexOf('?');
        if (cut >= 0) href = href.substring(0, cut);
        return href;
    }

    private static String resolveAgainst(String contentPath, String href) {
        String unix = href.replace('\\', '/').strip();
        if (unix.startsWith("/")) unix = unix.substring(1);
        String base = contentPath == null ? "" : contentPath.replace('\\', '/');
        int slash = base.lastIndexOf('/');
        ArrayDeque<String> parts = new ArrayDeque<>();
        if (slash >= 0) {
            for (String part : base.substring(0, slash).split("/")) {
                if (!part.isBlank() && !part.equals(".")) parts.addLast(part);
            }
        }
        for (String part : unix.split("/")) {
            if (part.isBlank() || part.equals(".")) continue;
            if (part.equals("..")) {
                if (!parts.isEmpty()) parts.removeLast();
                continue;
            }
            parts.addLast(part);
        }
        return String.join("/", parts);
    }

    private static String basename(String path) {
        int slash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        String name = slash >= 0 ? path.substring(slash + 1) : path;
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }

    private static boolean supportedMajor(String version) {
        String major = version.contains(".") ? version.substring(0, version.indexOf('.')) : version;
        return "1".equals(major) || SUPPORTED_MAJORS.contains(version);
    }

    private static String normalizeChecksum(String value) {
        String hex = ContentHash.stripPrefix(value);
        return "sha256:" + hex;
    }

    private static Issue issue(String code, String path, java.util.UUID pageId, String detail) {
        return new Issue(code, path, pageId, detail);
    }
}
