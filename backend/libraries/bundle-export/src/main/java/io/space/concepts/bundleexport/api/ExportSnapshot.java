package io.space.concepts.bundleexport.api;

import java.time.Instant;
import java.util.*;

/** Captured input, containing no current draft, permissions, tokens, or site configuration. */
public record ExportSnapshot(String generator, Instant generatedAt, List<Page> pages, List<Node> toc) {
    public ExportSnapshot {
        pages = List.copyOf(pages);
        toc = List.copyOf(toc);
    }

    public record Page(
            UUID id,
            String externalId,
            String slug,
            String title,
            String format,
            String content,
            Map<String, Object> seo,
            String icon,
            Map<String, String> properties,
            List<Attachment> attachments,
            io.space.content.ContentProfile contentProfile,
            io.space.content.ContentTypeSnapshot contentTypeDefinition) {
        public Page(
                UUID id,
                String externalId,
                String slug,
                String title,
                String format,
                String content,
                Map<String, Object> seo,
                String icon,
                Map<String, String> properties,
                List<Attachment> attachments,
                io.space.content.ContentProfile contentProfile) {
            this(
                    id,
                    externalId,
                    slug,
                    title,
                    format,
                    content,
                    seo,
                    icon,
                    properties,
                    attachments,
                    contentProfile,
                    null);
        }

        public Page(
                UUID id,
                String externalId,
                String slug,
                String title,
                String format,
                String content,
                Map<String, Object> seo,
                String icon,
                Map<String, String> properties,
                List<Attachment> attachments) {
            this(
                    id,
                    externalId,
                    slug,
                    title,
                    format,
                    content,
                    seo,
                    icon,
                    properties,
                    attachments,
                    io.space.content.ContentProfile.defaults(format));
        }

        public Page {
            contentProfile = contentProfile == null ? io.space.content.ContentProfile.defaults(format) : contentProfile;
            seo = Collections.unmodifiableMap(new LinkedHashMap<>(seo));
            properties = Collections.unmodifiableMap(new TreeMap<>(properties));
            attachments = List.copyOf(attachments);
        }
    }

    public record Attachment(String path, String storageKey, String sha256) {}

    public record Node(String label, String kind, String ref, String url, List<Node> children) {
        public Node {
            children = List.copyOf(children);
        }
    }
}
