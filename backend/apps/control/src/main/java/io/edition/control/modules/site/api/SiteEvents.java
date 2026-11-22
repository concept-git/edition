package io.edition.control.modules.site.api;

/** Site 状态变化事件，不点名其他概念。 */
public final class SiteEvents {
    private SiteEvents() {}

    public record Created(SiteApi.ActorId actor, SiteApi.View site) {}

    public record Renamed(SiteApi.ActorId actor, SiteApi.View site) {}

    public record Mounted(SiteApi.ActorId actor, SiteApi.View site) {}

    public record Remounted(SiteApi.ActorId actor, SiteApi.View site) {}

    public record Unmounted(SiteApi.ActorId actor, SiteApi.View site) {}

    public record Reordered(SiteApi.ActorId actor, SiteApi.View site) {}

    public record Deleted(SiteApi.ActorId actor, SiteApi.SiteId site, java.util.UUID tenantId) {}

    public record SettingsChanged(SiteApi.ActorId actor, SiteApi.View site) {}
}
