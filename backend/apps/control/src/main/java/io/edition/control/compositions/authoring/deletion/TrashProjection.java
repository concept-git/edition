package io.edition.control.compositions.authoring.deletion;

import io.edition.concepts.page.api.PageApi;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** 已回收页 → 回收列表投影；不含正文。 */
final class TrashProjection {
    private TrashProjection() {}

    static DeletionTypes.TrashItem item(PageApi.View page, String slug, Set<DeletionTypes.Action> actions) {
        return new DeletionTypes.TrashItem(
                page.id(),
                page.title(),
                slug,
                page.status().name().toLowerCase(Locale.ROOT),
                page.format().name().toLowerCase(Locale.ROOT),
                page.trashedAt(),
                actions);
    }

    static DeletionTypes.TrashPage page(
            List<DeletionTypes.TrashItem> items, String nextCursor, Set<DeletionTypes.Action> actions) {
        return new DeletionTypes.TrashPage(items, nextCursor, null, actions);
    }
}
