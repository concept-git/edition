package io.edition.control.entry.http.tag;

import io.edition.control.compositions.authoring.pageediting.PageEditingTypes;
import io.edition.control.compositions.authoring.tagging.TaggingTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** 标签端点的 OpenAPI 形态：flow 记录 → 契约 DTO。 */
final class TagContract {
    private TagContract() {}

    private static Set<String> catalogActions(Set<TaggingTypes.Action> actions) {
        return actions.stream().map(TaggingTypes.Action::value).collect(Collectors.toSet());
    }

    private static Set<String> pageActions(Set<PageEditingTypes.Action> actions) {
        return actions.stream().map(PageEditingTypes.Action::value).collect(Collectors.toSet());
    }

    @Schema(name = "TagPage")
    record CatalogResponse(List<CountResponse> items, String nextCursor, Set<String> allowedActions) {
        static CatalogResponse from(TaggingTypes.TagCatalog value) {
            return new CatalogResponse(
                    value.items().stream().map(CountResponse::from).toList(),
                    value.nextCursor(),
                    catalogActions(value.allowedActions()));
        }
    }

    @Schema(name = "TagCount")
    record CountResponse(String label, long pageCount) {
        static CountResponse from(TaggingTypes.TagCount value) {
            return new CountResponse(value.label(), value.pageCount());
        }
    }

    @Schema(name = "TaggedPagePage")
    record TaggedPageResponse(List<TaggedPageItem> items, String nextCursor) {
        static TaggedPageResponse from(TaggingTypes.TaggedPagePage value) {
            return new TaggedPageResponse(
                    value.items().stream().map(TaggedPageItem::from).toList(), value.nextCursor());
        }
    }

    @Schema(name = "TaggedPage", description = "PageSummary plus spaceId for cross-space aggregation")
    record TaggedPageItem(
            UUID id,
            String title,
            String slug,
            UUID spaceId,
            String status,
            String format,
            String icon,
            List<String> tags,
            boolean driftFlag,
            Instant updatedAt,
            UUID updatedBy,
            Instant publishedAt,
            Set<String> allowedActions) {
        static TaggedPageItem from(TaggingTypes.TaggedPage value) {
            return new TaggedPageItem(
                    value.id(),
                    value.title(),
                    value.slug(),
                    value.spaceId(),
                    value.status(),
                    value.format(),
                    value.icon(),
                    value.tags(),
                    value.driftFlag(),
                    value.updatedAt(),
                    value.updatedBy(),
                    value.publishedAt(),
                    pageActions(value.allowedActions()));
        }
    }

    @Schema(name = "TagRename")
    record RenameResponse(String from, String to) {
        static RenameResponse from(TaggingTypes.RenameView value) {
            return new RenameResponse(value.from(), value.to());
        }
    }
}
