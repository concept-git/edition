package io.edition.delivery.contract;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Read contract for the authoritative publication and its search input. */
public final class SiteSnapshot {
    private SiteSnapshot() {}

    public record SearchSettings(List<String> fields, long revision) {
        public SearchSettings {
            fields = List.copyOf(fields);
            if (fields.size() != 3
                    || !new java.util.HashSet<>(fields).equals(java.util.Set.of("title", "headings", "body"))
                    || revision < 0) throw new IllegalArgumentException("invalid search settings");
        }
    }

    public record Brand(
            String siteName,
            String logo,
            String favicon,
            String primaryColor,
            String locale,
            String titleTemplate,
            String analyticsId,
            String robotsPolicy) {}

    public record Space(UUID id, String slug, String name, UUID releaseId, List<Node> navigation) {
        public Space {
            navigation = List.copyOf(navigation);
        }
    }

    public record Node(String label, String kind, String href, UUID pageId, List<Node> children) {
        public Node {
            children = List.copyOf(children);
        }
    }

    public record Attachment(String path, String storageKey, String sha256) {}

    public record Page(
            UUID id,
            UUID spaceId,
            UUID releaseId,
            String path,
            String title,
            String format,
            String contentHash,
            String content,
            Map<String, String> seo,
            Map<String, String> properties,
            List<Attachment> attachments,
            Instant promotedAt,
            Long contentBytes,
            String contentSha256,
            io.edition.content.ContentProfile contentProfile,
            io.edition.content.ContentTypeSnapshot contentTypeDefinition) {
        public Page(
                UUID id,
                UUID spaceId,
                UUID releaseId,
                String path,
                String title,
                String format,
                String contentHash,
                String content,
                Map<String, String> seo,
                Map<String, String> properties,
                List<Attachment> attachments,
                Instant promotedAt,
                Long contentBytes,
                String contentSha256,
                io.edition.content.ContentProfile contentProfile) {
            this(
                    id,
                    spaceId,
                    releaseId,
                    path,
                    title,
                    format,
                    contentHash,
                    content,
                    seo,
                    properties,
                    attachments,
                    promotedAt,
                    contentBytes,
                    contentSha256,
                    contentProfile,
                    null);
        }

        public Page(
                UUID id,
                UUID spaceId,
                UUID releaseId,
                String path,
                String title,
                String format,
                String contentHash,
                String content,
                Map<String, String> seo,
                Map<String, String> properties,
                List<Attachment> attachments,
                Instant promotedAt,
                Long contentBytes,
                String contentSha256) {
            this(
                    id,
                    spaceId,
                    releaseId,
                    path,
                    title,
                    format,
                    contentHash,
                    content,
                    seo,
                    properties,
                    attachments,
                    promotedAt,
                    contentBytes,
                    contentSha256,
                    io.edition.content.ContentProfile.defaults(format));
        }

        public Page(
                UUID id,
                UUID spaceId,
                UUID releaseId,
                String path,
                String title,
                String format,
                String contentHash,
                String content,
                Map<String, String> seo,
                Map<String, String> properties,
                List<Attachment> attachments,
                Instant promotedAt) {
            this(
                    id,
                    spaceId,
                    releaseId,
                    path,
                    title,
                    format,
                    contentHash,
                    content,
                    seo,
                    properties,
                    attachments,
                    promotedAt,
                    content == null ? null : (long) content.getBytes(java.nio.charset.StandardCharsets.UTF_8).length,
                    content == null ? null : sha256(content));
        }

        public Page {
            contentProfile =
                    contentProfile == null ? io.edition.content.ContentProfile.defaults(format) : contentProfile;
            if (content != null && (contentBytes == null || contentSha256 == null)) {
                throw new IllegalArgumentException("page content metadata is required");
            }
            seo = Map.copyOf(seo);
            properties = Map.copyOf(properties);
            attachments = List.copyOf(attachments);
        }
    }

    private static String sha256(String content) {
        try {
            return java.util.HexFormat.of()
                    .formatHex(java.security.MessageDigest.getInstance("SHA-256")
                            .digest(content.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }
}
