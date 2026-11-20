package io.space.control.entry.http.page;

import io.space.control.compositions.authoring.deletion.DeletionTypes;
import io.space.control.compositions.authoring.pageediting.PageEditingTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** 页面端点的 OpenAPI 形态：flow 记录 → 契约 DTO；allowedActions 以线值字符串暴露。 */
final class PageContract {
    private PageContract() {}

    private static Set<String> actions(Set<PageEditingTypes.Action> actions) {
        return actions.stream().map(PageEditingTypes.Action::value).collect(Collectors.toSet());
    }

    private static Set<String> trashActions(Set<DeletionTypes.Action> actions) {
        return actions.stream().map(DeletionTypes.Action::value).collect(Collectors.toSet());
    }

    @Schema(name = "TrashPage")
    record TrashPageResponse(
            List<TrashItemResponse> items,
            @Schema(nullable = true) String nextCursor,
            @Schema(nullable = true) Long total,
            Set<String> allowedActions) {
        static TrashPageResponse from(DeletionTypes.TrashPage value) {
            return new TrashPageResponse(
                    value.items().stream().map(TrashItemResponse::from).toList(),
                    value.nextCursor(),
                    value.total(),
                    trashActions(value.allowedActions()));
        }
    }

    @Schema(name = "TrashItem")
    record TrashItemResponse(
            UUID id,
            String title,
            String slug,
            String status,
            String format,
            @Schema(nullable = true) Instant trashedAt,
            Set<String> allowedActions) {
        static TrashItemResponse from(DeletionTypes.TrashItem value) {
            return new TrashItemResponse(
                    value.id(),
                    value.title(),
                    value.slug(),
                    value.status(),
                    value.format(),
                    value.trashedAt(),
                    trashActions(value.allowedActions()));
        }
    }

    @Schema(name = "PagePage")
    record PageResponse(
            List<SummaryResponse> items,
            @Schema(nullable = true) String nextCursor,
            @Schema(nullable = true) Long total,
            Set<String> allowedActions) {
        static PageResponse from(PageEditingTypes.PagePage value) {
            return new PageResponse(
                    value.items().stream().map(SummaryResponse::from).toList(),
                    value.nextCursor(),
                    value.total(),
                    actions(value.allowedActions()));
        }
    }

    @Schema(name = "PageSummary")
    record SummaryResponse(
            UUID id,
            String title,
            String slug,
            String status,
            String format,
            @Schema(nullable = true) String icon,
            List<String> tags,
            boolean driftFlag,
            Instant updatedAt,
            UUID updatedBy,

            @Schema(
                    nullable = true,
                    deprecated = true,
                    description = "Unknown page-level publication time; use Release.promotedAt and site delivery facts")
            Instant publishedAt,

            Set<String> allowedActions,
            String contentType,
            String versionRef,
            Map<String, Object> interpretation) {
        static SummaryResponse from(PageEditingTypes.PageSummary value) {
            return new SummaryResponse(
                    value.id(),
                    value.title(),
                    value.slug(),
                    value.status(),
                    value.format(),
                    value.icon(),
                    value.tags(),
                    value.driftFlag(),
                    value.updatedAt(),
                    value.updatedBy(),
                    value.publishedAt(),
                    actions(value.allowedActions()),
                    value.contentProfile().contentType(),
                    value.contentProfile().versionRef(),
                    value.contentProfile().interpretation());
        }
    }

    @Schema(name = "PageDetail")
    record DetailResponse(
            UUID id,
            String title,
            String slug,
            String status,
            String format,
            @Schema(nullable = true) String icon,
            List<String> tags,
            boolean driftFlag,
            Instant updatedAt,
            UUID updatedBy,

            @Schema(
                    nullable = true,
                    deprecated = true,
                    description = "Unknown page-level publication time; use Release.promotedAt and site delivery facts")
            Instant publishedAt,

            Set<String> allowedActions,
            String content,
            int revision,
            PageEditingTypes.Seo seo,
            Map<String, String> properties,
            List<PageEditingTypes.Attachment> attachments,
            @Schema(nullable = true) Instant trashedAt,
            long revisionCount,
            long wordCount,
            long readingTime,
            String contentType,
            String versionRef,
            Map<String, Object> interpretation) {
        static DetailResponse from(PageEditingTypes.PageDetail value) {
            return new DetailResponse(
                    value.id(),
                    value.title(),
                    value.slug(),
                    value.status(),
                    value.format(),
                    value.icon(),
                    value.tags(),
                    value.driftFlag(),
                    value.updatedAt(),
                    value.updatedBy(),
                    value.publishedAt(),
                    actions(value.allowedActions()),
                    value.content(),
                    value.revision(),
                    value.seo(),
                    value.properties(),
                    value.attachments(),
                    value.trashedAt(),
                    value.revisionCount(),
                    value.wordCount(),
                    value.readingTime(),
                    value.contentProfile().contentType(),
                    value.contentProfile().versionRef(),
                    value.contentProfile().interpretation());
        }
    }

    @Schema(name = "AttachmentLink", description = "实时鉴权代理地址；expiresAt为空；不进 PageDetail")
    record AttachmentLinkResponse(
            String url, @Schema(nullable = true) Instant expiresAt, String filename, String mime, long sizeBytes) {
        static AttachmentLinkResponse from(PageEditingTypes.AttachmentLink value) {
            return new AttachmentLinkResponse(
                    value.url(), value.expiresAt(), value.filename(), value.mime(), value.sizeBytes());
        }
    }

    @Schema(name = "PagePreview")
    record PreviewResponse(String html) {
        static PreviewResponse from(PageEditingTypes.Preview value) {
            return new PreviewResponse(value.html());
        }
    }

    @Schema(name = "RevisionPage")
    record RevisionPageResponse(List<RevisionEntryResponse> items, String nextCursor) {
        static RevisionPageResponse from(PageEditingTypes.RevisionPage value) {
            return new RevisionPageResponse(
                    value.items().stream().map(RevisionEntryResponse::from).toList(), value.nextCursor());
        }
    }

    @Schema(name = "RevisionEntry")
    record RevisionEntryResponse(
            int n,
            PageEditingTypes.ActorView actor,
            Instant createdAt,
            @Schema(nullable = true) String note,
            long sizeBytes,
            long sizeDelta) {
        static RevisionEntryResponse from(PageEditingTypes.RevisionEntry value) {
            return new RevisionEntryResponse(
                    value.n(), value.actor(), value.createdAt(), value.note(), value.sizeBytes(), value.sizeDelta());
        }
    }

    @Schema(name = "RevisionDetail")
    record RevisionDetailResponse(
            int n,
            PageEditingTypes.ActorView actor,
            Instant createdAt,
            @Schema(nullable = true) String note,
            long sizeBytes,
            long sizeDelta,
            String content,
            String contentType,
            String versionRef,
            Map<String, Object> interpretation) {
        static RevisionDetailResponse from(PageEditingTypes.RevisionDetail value) {
            return new RevisionDetailResponse(
                    value.n(),
                    value.actor(),
                    value.createdAt(),
                    value.note(),
                    value.sizeBytes(),
                    value.sizeDelta(),
                    value.content(),
                    value.contentProfile() == null
                            ? null
                            : value.contentProfile().contentType(),
                    value.contentProfile() == null
                            ? null
                            : value.contentProfile().versionRef(),
                    value.contentProfile().interpretation());
        }
    }

    @Schema(name = "RevisionDiff")
    record DiffResponse(int from, int to, List<DiffHunkResponse> hunks) {
        static DiffResponse from(PageEditingTypes.RevisionDiff value) {
            return new DiffResponse(
                    value.from(),
                    value.to(),
                    value.hunks().stream().map(DiffHunkResponse::from).toList());
        }
    }

    record DiffHunkResponse(int oldStart, int oldLines, int newStart, int newLines, List<DiffLineResponse> lines) {
        static DiffHunkResponse from(PageEditingTypes.DiffHunk value) {
            return new DiffHunkResponse(
                    value.oldStart(),
                    value.oldLines(),
                    value.newStart(),
                    value.newLines(),
                    value.lines().stream().map(DiffLineResponse::from).toList());
        }
    }

    record DiffLineResponse(String type, String content) {
        static DiffLineResponse from(PageEditingTypes.DiffLine value) {
            return new DiffLineResponse(value.type(), value.content());
        }
    }
}
