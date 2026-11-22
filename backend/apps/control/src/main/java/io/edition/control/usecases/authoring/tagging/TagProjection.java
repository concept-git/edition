package io.edition.control.usecases.authoring.tagging;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.tag.api.TagApi;
import io.edition.control.usecases.authoring.pageediting.PageEditingTypes;
import io.edition.shared.KeysetCursor;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** 概念视图 → 标签目录与聚合页投影。 */
final class TagProjection {
    private TagProjection() {}

    static TaggingTypes.TaggedPage taggedPage(
            PageApi.View page,
            String slug,
            UUID spaceId,
            List<String> tags,
            Set<PageEditingTypes.Action> actions,
            boolean driftFlag) {
        return new TaggingTypes.TaggedPage(
                page.id(),
                page.title(),
                slug,
                spaceId,
                stored(page.status()),
                stored(page.format()),
                page.icon(),
                tags,
                driftFlag,
                page.updatedAt(),
                page.updatedBy().id(),
                null,
                actions);
    }

    static Set<UUID> allItems(List<TagApi.Match> matches) {
        return matches.stream().flatMap(match -> match.items().stream()).collect(Collectors.toUnmodifiableSet());
    }

    static boolean afterCursor(TaggingTypes.TagCount count, TagCountCursor.Key cursor) {
        if (count.pageCount() < cursor.pageCount()) return true;
        if (count.pageCount() > cursor.pageCount()) return false;
        return count.label().compareTo(cursor.label()) > 0;
    }

    static boolean afterPage(TaggingTypes.TaggedPage item, KeysetCursor cursor) {
        int time = item.updatedAt().compareTo(cursor.at());
        if (time < 0) return true;
        if (time > 0) return false;
        return item.id().compareTo(cursor.id()) < 0;
    }

    private static String stored(Enum<?> value) {
        return value.name().toLowerCase(Locale.ROOT);
    }
}
