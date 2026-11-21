package io.edition.concepts.importformat.formats.bundle;

import io.edition.concepts.importformat.api.*;
import io.edition.concepts.importformat.archive.PackFiles;
import io.edition.concepts.importformat.archive.PackIo;
import io.edition.concepts.importformat.archive.PackLookup;
import io.edition.concepts.importformat.archive.PackPaths;
import io.edition.concepts.importformat.attachments.AttachmentCollector;
import io.edition.concepts.importformat.contract.AdaptSink;
import io.edition.concepts.importformat.contract.AdaptedPack;
import io.edition.concepts.importformat.contract.ImportFormatAdapter;
import io.edition.concepts.importformat.contract.ImportLimits;
import io.edition.concepts.importformat.contract.PackIndex;
import io.edition.concepts.importformat.contract.PackSource;
import io.edition.content.DocumentFormat;
import io.edition.shared.Sha256;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
public final class ManifestBundleAdapter implements ImportFormatAdapter {
    public static final String ID = "bundle-v1";
    private final JsonMapper json;

    public ManifestBundleAdapter(JsonMapper json) {
        this.json = json;
    }

    @Override
    public String id() {
        return ID;
    }

    @Override
    public boolean metadataEntry(String name) {
        return PackPaths.basename(name).equals("manifest.json");
    }

    @Override
    public int order() {
        return 0;
    }

    @Override
    public boolean sniff(PackIndex index) {
        return PackFiles.hasBasename(index, "manifest.json");
    }

    @Override
    public Outcome adapt(PackSource source, AdaptSink sink) {
        String manifestName = manifestEntry(source.index());
        if (manifestName == null) {
            return new Outcome.Invalid(List.of(new AdaptedPack.Issue("unreadable_manifest", null, "manifest.json")));
        }
        byte[] manifestBytes;
        try {
            manifestBytes = PackIo.readLimited(source, manifestName, ImportLimits.MAX_CONTENT_BYTES);
        } catch (IOException io) {
            return new Outcome.Invalid(
                    List.of(new AdaptedPack.Issue("unreadable_manifest", manifestName, io.getMessage())));
        }
        if (manifestBytes == null) {
            return new Outcome.Invalid(
                    List.of(new AdaptedPack.Issue("unreadable_manifest", manifestName, "too large")));
        }
        JsonNode root;
        try {
            root = json.readTree(manifestBytes);
        } catch (JacksonException corrupt) {
            return new Outcome.Invalid(
                    List.of(new AdaptedPack.Issue("unreadable_manifest", manifestName, corrupt.getMessage())));
        }
        if (root == null || !root.isObject()) {
            return new Outcome.Invalid(List.of(new AdaptedPack.Issue("invalid_manifest", manifestName, "object")));
        }
        String version = text(root, "bundleVersion");
        if (!supportedMajor(version)) {
            return new Outcome.Invalid(
                    List.of(new AdaptedPack.Issue("unsupported_bundle_version", "bundleVersion", version)));
        }
        String generator = text(root, "generator");
        if (generator.isBlank()) generator = ID;
        JsonNode checksumNode = root.get("checksums");
        Map<String, String> listedChecksums = new LinkedHashMap<>();
        if (checksumNode != null && checksumNode.isObject()) {
            for (var entry : checksumNode.properties()) {
                listedChecksums.put(entry.getKey(), entry.getValue().asString());
            }
        }
        PackLookup lookup = new PackLookup(source.index());
        AttachmentCollector attachments = new AttachmentCollector(source, sink);
        List<AdaptedPack.Issue> errors = new ArrayList<>();
        List<AdaptedPack.Page> pages = new ArrayList<>();
        Set<String> consumed = new LinkedHashSet<>();
        consumed.add(manifestName);
        JsonNode pageNodes = root.get("pages");
        if (pageNodes == null || !pageNodes.isArray()) {
            return new Outcome.Invalid(List.of(new AdaptedPack.Issue("invalid_manifest", "pages", "required")));
        }
        int seq = 0;
        for (JsonNode pageNode : pageNodes) {
            AdaptedPack.Page page =
                    readPage(source, pageNode, listedChecksums, lookup, attachments, consumed, errors, seq);
            if (page != null) pages.add(page);
            seq++;
            if (attachments.fatal() != null) {
                errors.add(attachments.fatal());
                return new Outcome.Invalid(errors);
            }
        }
        if (!errors.isEmpty()) return new Outcome.Invalid(errors);
        attachments.scanLeftovers(consumed);
        if (attachments.fatal() != null) {
            return new Outcome.Invalid(List.of(attachments.fatal()));
        }
        List<AdaptedPack.TocNode> toc = readToc(root.get("toc"));
        return new Outcome.Adapted(new AdaptedPack(generator, pages, toc, attachments.checksums(), sink.issues()));
    }

    private AdaptedPack.Page readPage(
            PackSource source,
            JsonNode node,
            Map<String, String> listedChecksums,
            PackLookup lookup,
            AttachmentCollector attachments,
            Set<String> consumed,
            List<AdaptedPack.Issue> errors,
            int seq) {
        String contentPath = text(node, "content");
        String zipName = lookup.find(contentPath);
        if (contentPath.isBlank() || zipName == null) {
            errors.add(new AdaptedPack.Issue("invalid_manifest", contentPath, "missing content"));
            return null;
        }
        consumed.add(zipName);
        byte[] bytes;
        try {
            bytes = PackIo.readLimited(source, zipName, ImportLimits.MAX_CONTENT_BYTES);
        } catch (IOException io) {
            errors.add(new AdaptedPack.Issue("unreadable_entry", zipName, io.getMessage()));
            return null;
        }
        if (bytes == null) {
            errors.add(new AdaptedPack.Issue("content_too_large", contentPath, null));
            return null;
        }
        String actual = Sha256.hex(bytes);
        String expected = listedChecksums.get(contentPath);
        if (!PackIo.checksumMatches(expected, actual)) {
            errors.add(new AdaptedPack.Issue("checksum_mismatch", contentPath, actual));
            return null;
        }
        attachments.recordChecksum(contentPath, actual);
        List<String> pageAttachments = new ArrayList<>();
        JsonNode listed = node.get("attachments");
        if (listed != null && listed.isArray()) {
            for (JsonNode item : listed) {
                String logical = item.asString();
                String attachmentZip = lookup.find(logical);
                if (attachmentZip == null) {
                    errors.add(new AdaptedPack.Issue("invalid_manifest", logical, "missing attachment"));
                    continue;
                }
                consumed.add(attachmentZip);
                String stored = attachments.putZipEntryAs(attachmentZip, logical);
                if (attachments.fatal() != null) return null;
                if (stored != null) {
                    String want = listedChecksums.get(logical);
                    if (!PackIo.checksumMatches(want, attachments.checksums().get(logical))) {
                        errors.add(new AdaptedPack.Issue(
                                "checksum_mismatch",
                                logical,
                                attachments.checksums().get(logical)));
                    }
                    pageAttachments.add(stored);
                }
            }
        }
        if (pageAttachments.size() > ImportLimits.MAX_ATTACHMENTS_PER_PAGE) {
            errors.add(new AdaptedPack.Issue(
                    "too_many_attachments", contentPath, Integer.toString(pageAttachments.size())));
            return null;
        }
        String format = text(node, "format").toLowerCase(Locale.ROOT);
        if (DocumentFormat.fromWire(format).isEmpty()) {
            errors.add(new AdaptedPack.Issue("invalid_manifest", contentPath, "format"));
            return null;
        }
        io.edition.content.ContentProfile profile;
        try {
            profile = new io.edition.content.ContentProfile(
                    emptyToNull(text(node, "contentType")) == null ? format : text(node, "contentType"),
                    emptyToNull(text(node, "versionRef")),
                    node.has("interpretation")
                            ? json.convertValue(
                                    node.get("interpretation"),
                                    new tools.jackson.core.type.TypeReference<Map<String, Object>>() {})
                            : Map.of());
        } catch (IllegalArgumentException | JacksonException invalid) {
            errors.add(new AdaptedPack.Issue("invalid_manifest", contentPath, "invalid interpretation"));
            return null;
        }
        return new AdaptedPack.Page(
                text(node, "externalId"),
                text(node, "slug"),
                text(node, "title"),
                format,
                new String(bytes, java.nio.charset.StandardCharsets.UTF_8),
                readSeo(node.get("seo")),
                readProperties(node.get("properties")),
                pageAttachments,
                seq,
                emptyToNull(text(node, "icon")),
                profile,
                node.hasNonNull("contentTypeDefinition")
                        ? json.treeToValue(
                                node.get("contentTypeDefinition"), io.edition.content.ContentTypeSnapshot.class)
                        : null);
    }

    private static List<AdaptedPack.TocNode> readToc(JsonNode array) {
        if (array == null || !array.isArray()) return List.of();
        List<AdaptedPack.TocNode> nodes = new ArrayList<>();
        for (JsonNode node : array) {
            String kind = text(node, "kind").toLowerCase(Locale.ROOT);
            nodes.add(new AdaptedPack.TocNode(
                    text(node, "label"),
                    kind.isBlank() ? "target" : kind,
                    emptyToNull(text(node, "ref")),
                    emptyToNull(text(node, "url")),
                    readToc(node.get("children"))));
        }
        return nodes;
    }

    private static AdaptedPack.Seo readSeo(JsonNode node) {
        if (node == null || node.isNull() || !node.isObject()) return AdaptedPack.Seo.empty();
        return new AdaptedPack.Seo(
                emptyToNull(text(node, "title")),
                emptyToNull(text(node, "des")) == null
                        ? emptyToNull(text(node, "description"))
                        : emptyToNull(text(node, "des")),
                emptyToNull(text(node, "keywords")),
                emptyToNull(text(node, "ogImage")),
                node.path("noIndex").asBoolean(false));
    }

    private Map<String, String> readProperties(JsonNode node) {
        if (node == null || !node.isObject()) return Map.of();
        Map<String, String> properties = new LinkedHashMap<>();
        for (var entry : node.properties()) {
            properties.put(entry.getKey(), scalar(entry.getValue()));
        }
        return properties;
    }

    private String scalar(JsonNode value) {
        if (value == null || value.isNull()) return "";
        if (value.isString() || value.isNumber() || value.isBoolean()) return value.asString();
        try {
            return json.writeValueAsString(value);
        } catch (JacksonException impossible) {
            return value.toString();
        }
    }

    private static String manifestEntry(PackIndex index) {
        String best = null;
        for (String name : index.names()) {
            if (PackPaths.discarded(name)) continue;
            if (!PackPaths.basename(name).equals("manifest.json")) continue;
            if (best == null || name.length() < best.length()) best = name;
        }
        return best;
    }

    private static boolean supportedMajor(String version) {
        if (version == null || version.isBlank()) return false;
        String major = version.contains(".") ? version.substring(0, version.indexOf('.')) : version;
        return "1".equals(major);
    }

    private static String text(JsonNode node, String field) {
        if (node == null || node.get(field) == null || node.get(field).isNull()) return "";
        JsonNode value = node.get(field);
        if (value.isString() || value.isNumber() || value.isBoolean()) return value.asString();
        return value.toString();
    }

    private static String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
