package io.edition.concepts.importformat.formats.ipd;

import io.edition.concepts.importformat.api.*;
import io.edition.concepts.importformat.archive.PackFiles;
import io.edition.concepts.importformat.archive.PackIo;
import io.edition.concepts.importformat.archive.PackLookup;
import io.edition.concepts.importformat.archive.PackPaths;
import io.edition.concepts.importformat.attachments.AttachmentCollector;
import io.edition.concepts.importformat.attachments.HtmlAttachments;
import io.edition.concepts.importformat.contract.AdaptSink;
import io.edition.concepts.importformat.contract.AdaptedPack;
import io.edition.concepts.importformat.contract.ImportFormatAdapter;
import io.edition.concepts.importformat.contract.ImportLimits;
import io.edition.concepts.importformat.contract.PackIndex;
import io.edition.concepts.importformat.contract.PackSource;
import io.edition.shared.Sha256;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * IPD 文档导出包（华为云文档站点导出形态：{@code ALL_META.TXT.json} + {@code CLASS.TXT.json} + HTML 碎片）。
 * 适配器 id 仍为 {@code hwcloud-docs}（写进 generator 的契约值），类名按来源形态命名。
 */
@Component
public final class IpdExportAdapter implements ImportFormatAdapter {
    public static final String ID = "hwcloud-docs";
    private final JsonMapper json;

    public IpdExportAdapter(JsonMapper json) {
        this.json = json;
    }

    @Override
    public String id() {
        return ID;
    }

    @Override
    public boolean metadataEntry(String name) {
        return java.util.Set.of("ALL_META.TXT.json", "CLASS.TXT.json").contains(PackPaths.basename(name));
    }

    @Override
    public int order() {
        return 10;
    }

    @Override
    public boolean sniff(PackIndex index) {
        return PackFiles.hasBasename(index, "ALL_META.TXT.json") && PackFiles.hasBasename(index, "CLASS.TXT.json");
    }

    @Override
    public Outcome adapt(PackSource source, AdaptSink sink) {
        String metaName = named(source.index(), "ALL_META.TXT.json");
        String className = named(source.index(), "CLASS.TXT.json");
        if (metaName == null || className == null) {
            return new Outcome.Invalid(List.of(new AdaptedPack.Issue("missing_meta", null, null)));
        }
        JsonNode meta;
        JsonNode klass;
        String reading = metaName;
        try {
            meta = readJson(source, metaName);
            reading = className;
            klass = readJson(source, className);
        } catch (IOException | JacksonException failure) {
            return new Outcome.Invalid(
                    List.of(new AdaptedPack.Issue("unreadable_manifest", reading, "cannot read JSON manifest")));
        }
        if (meta == null || !meta.isArray()) {
            return new Outcome.Invalid(List.of(new AdaptedPack.Issue("unreadable_manifest", metaName, "ALL_META")));
        }
        if (klass == null || !klass.isArray()) {
            return new Outcome.Invalid(List.of(new AdaptedPack.Issue("unreadable_manifest", className, "CLASS")));
        }
        try {
            return adaptManifest(
                    IpdManifest.parse(meta, klass, source.index(), sink), source, sink, metaName, className);
        } catch (IpdManifest.Invalid invalid) {
            return new Outcome.Invalid(List.of(invalid.issue));
        }
    }

    private Outcome adaptManifest(
            IpdManifest manifest, PackSource source, AdaptSink sink, String metaName, String className) {
        PackLookup lookup = new PackLookup(source.index(), true);
        AttachmentCollector attachments = new AttachmentCollector(source, sink);
        Map<String, String> slugByPath = new LinkedHashMap<>();
        Set<String> consumed = new LinkedHashSet<>(List.of(metaName, className));
        for (IpdManifest.PageSource page : manifest.pages.values()) {
            String slug = stableSlug(page.path);
            slugByPath.put(PackPaths.unix(page.path), slug);
            consumed.add(page.path);
        }
        Map<String, String> titles = new LinkedHashMap<>();
        List<AdaptedPack.Page> pages = new ArrayList<>();
        for (IpdManifest.PageSource page : manifest.pages.values()) {
            String raw;
            try {
                raw = PackIo.utf8Limited(source, page.path, ImportLimits.MAX_CONTENT_BYTES);
            } catch (IOException io) {
                return new Outcome.Invalid(
                        List.of(new AdaptedPack.Issue("unreadable_entry", page.path, "cannot read html")));
            }
            if (raw == null) {
                return new Outcome.Invalid(List.of(new AdaptedPack.Issue("content_too_large", page.path, null)));
            }
            Document document = Jsoup.parse(raw);
            try {
                IpdHtmlIntegrity.check(document, page.path, source, lookup, manifest.pages.keySet(), sink);
            } catch (IOException failure) {
                return new Outcome.Invalid(List.of(
                        new AdaptedPack.Issue("unreadable_entry", page.path, "cannot read referenced resource")));
            }
            String title = pageTitle(page, document);
            if (page.meta == null || page.meta.title() == null) sink.info("title_fallback", page.path, title);
            titles.put(page.path, title);
            List<String> pageAttachments = HtmlAttachments.collect(document, page.path, lookup, attachments);
            if (attachments.fatal() != null) return new Outcome.Invalid(List.of(attachments.fatal()));
            if (pageAttachments.size() > ImportLimits.MAX_ATTACHMENTS_PER_PAGE) {
                return new Outcome.Invalid(List.of(new AdaptedPack.Issue(
                        "too_many_attachments", page.path, Integer.toString(pageAttachments.size()))));
            }
            String externalId = PackPaths.unix(page.path);
            String contentPath = "content/" + externalId;
            attachments.recordChecksum(contentPath, Sha256.hex(raw.getBytes(StandardCharsets.UTF_8)));
            IpdManifest.Meta meta = page.meta;
            pages.add(new AdaptedPack.Page(
                    externalId,
                    slugByPath.get(externalId),
                    title,
                    "html",
                    raw,
                    meta == null
                            ? AdaptedPack.Seo.empty()
                            : new AdaptedPack.Seo(null, meta.description(), meta.keywords(), null, false),
                    extras(meta, page.path, sink),
                    pageAttachments,
                    pages.size()));
        }
        List<AdaptedPack.TocNode> toc = manifest.toc(titles);
        attachments.scanLeftovers(consumed);
        if (attachments.fatal() != null) return new Outcome.Invalid(List.of(attachments.fatal()));
        return new Outcome.Adapted(new AdaptedPack(ID, pages, toc, attachments.checksums(), sink.issues()));
    }

    private static String stableSlug(String path) {
        return new io.edition.content.ResourcePath(PackPaths.unix(path)).value();
    }

    private static String pageTitle(IpdManifest.PageSource page, Document document) {
        String title = page.meta == null ? null : page.meta.title();
        if (title == null) title = page.classTitle;
        if (title == null && !document.title().isBlank())
            title = document.title().strip();
        if (title == null && document.selectFirst("h1") != null) {
            title = document.selectFirst("h1").text().strip();
            if (title.isEmpty()) title = null;
        }
        if (title == null) title = PackPaths.stripExtension(page.path);
        return IpdManifest.checkedTitle(title, page.path + ":title");
    }

    private JsonNode readJson(PackSource source, String name) throws IOException, JacksonException {
        byte[] bytes = PackIo.readLimited(source, name, ImportLimits.MAX_CONTENT_BYTES);
        if (bytes == null) return null;
        return json.readTree(bytes);
    }

    private Map<String, String> extras(IpdManifest.Meta meta, String path, AdaptSink sink) {
        Map<String, String> properties = new LinkedHashMap<>();
        if (meta == null) return properties;
        for (var entry : meta.properties().entrySet()) {
            String value = scalar(entry.getValue());
            if (properties.size() >= ImportLimits.MAX_PROPERTIES
                    || value.length() > ImportLimits.MAX_PROPERTY_VALUE_CHARS
                    || !entry.getKey().matches("[A-Za-z][A-Za-z0-9_-]{0,63}")) {
                sink.info("property_dropped", path, entry.getKey() + ": unsupported property key or capacity exceeded");
                continue;
            }
            properties.put(entry.getKey(), value);
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

    private static String named(PackIndex index, String basename) {
        for (String name : index.names()) {
            if (PackPaths.discarded(name)) continue;
            if (PackPaths.basename(name).equals(basename)) return name;
        }
        return null;
    }
}
