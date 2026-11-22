package io.edition.control.modules.importformat.contract;

import io.edition.control.modules.importformat.api.*;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** 适配后的 Bundle v1 形状。无 pageId（由 sync 后赋）。 */
public record AdaptedPack(
        String generator, List<Page> pages, List<TocNode> toc, Map<String, String> checksums, List<Issue> info) {
    public AdaptedPack {
        Objects.requireNonNull(generator, "generator");
        pages = pages == null ? List.of() : List.copyOf(pages);
        toc = toc == null ? List.of() : List.copyOf(toc);
        checksums = checksums == null ? Map.of() : Map.copyOf(checksums);
        info = info == null ? List.of() : List.copyOf(info);
    }

    public record Page(
            String externalId,
            String slug,
            String title,
            String format,
            String content,
            Seo seo,
            Map<String, String> properties,
            List<String> attachments,
            int seq,
            String icon,
            io.edition.content.ContentProfile contentProfile,
            io.edition.content.ContentTypeSnapshot contentTypeDefinition) {
        public Page(
                String externalId,
                String slug,
                String title,
                String format,
                String content,
                Seo seo,
                Map<String, String> properties,
                List<String> attachments,
                int seq,
                String icon,
                io.edition.content.ContentProfile contentProfile) {
            this(
                    externalId,
                    slug,
                    title,
                    format,
                    content,
                    seo,
                    properties,
                    attachments,
                    seq,
                    icon,
                    contentProfile,
                    null);
        }

        public Page(
                String externalId,
                String slug,
                String title,
                String format,
                String content,
                Seo seo,
                Map<String, String> properties,
                List<String> attachments,
                int seq,
                String icon) {
            this(
                    externalId,
                    slug,
                    title,
                    format,
                    content,
                    seo,
                    properties,
                    attachments,
                    seq,
                    icon,
                    io.edition.content.ContentProfile.defaults(format));
        }

        public Page(
                String externalId,
                String slug,
                String title,
                String format,
                String content,
                Seo seo,
                Map<String, String> properties,
                List<String> attachments,
                int seq) {
            this(externalId, slug, title, format, content, seo, properties, attachments, seq, null);
        }

        public Page {
            contentProfile =
                    contentProfile == null ? io.edition.content.ContentProfile.defaults(format) : contentProfile;
            Objects.requireNonNull(externalId, "externalId");
            Objects.requireNonNull(slug, "slug");
            Objects.requireNonNull(title, "title");
            Objects.requireNonNull(format, "format");
            content = content == null ? "" : content;
            seo = seo == null ? Seo.empty() : seo;
            properties = properties == null ? Map.of() : Map.copyOf(properties);
            attachments = attachments == null ? List.of() : List.copyOf(attachments);
        }
    }

    public record Seo(String title, String description, String keywords, String ogImage, boolean noIndex) {
        public static Seo empty() {
            return new Seo(null, null, null, null, false);
        }
    }

    public record TocNode(String label, String kind, String ref, String url, List<TocNode> children) {
        public TocNode {
            Objects.requireNonNull(label, "toc label");
            Objects.requireNonNull(kind, "toc kind");
            children = children == null ? List.of() : List.copyOf(children);
        }
    }

    public record Issue(String code, String path, String detail) {
        public Issue {
            Objects.requireNonNull(code, "issue code");
        }
    }
}
