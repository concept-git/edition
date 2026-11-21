package io.edition.concepts.page.api;

import java.util.UUID;

public final class PageEvents {
    private PageEvents() {}

    public record Created(PageApi.Actor actor, PageApi.View page) {}

    public record Edited(PageApi.Actor actor, PageApi.View page) {}

    public record Renamed(PageApi.Actor actor, PageApi.View page) {}
    /** setSeo / setIcon / setProperty / removeProperty 完成。 */
    public record MetadataChanged(PageApi.Actor actor, PageApi.View page) {}

    public record Attached(PageApi.Actor actor, PageApi.View page, PageApi.Attachment attachment) {}

    public record Detached(PageApi.Actor actor, PageApi.View page, UUID ref) {}

    public record Trashed(PageApi.Actor actor, PageApi.View page) {}

    public record Restored(PageApi.Actor actor, PageApi.View page) {}

    public record Published(PageApi.Actor actor, PageApi.View page) {}

    public record Unpublished(PageApi.Actor actor, PageApi.View page) {}

    public record Purged(UUID pageId) {}
}
