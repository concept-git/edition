package io.edition.control.modules.space.api;

/** Space 状态变化事件，不点名其他概念。 */
public final class SpaceEvents {
    private SpaceEvents() {}

    public record Created(SpaceApi.ActorId actor, SpaceApi.View space) {}

    public record Renamed(SpaceApi.ActorId actor, SpaceApi.View space) {}

    public record Described(SpaceApi.ActorId actor, SpaceApi.View space) {}

    public record Archived(SpaceApi.ActorId actor, SpaceApi.View space) {}

    public record Restored(SpaceApi.ActorId actor, SpaceApi.View space) {}

    public record Converted(SpaceApi.ActorId actor, SpaceApi.View space) {}

    public record AutoReleaseSet(SpaceApi.ActorId actor, SpaceApi.View space) {}

    public record Reslugged(SpaceApi.Placement placement) {}

    public record Transferred(SpaceApi.Placement from, SpaceApi.Placement to) {}

    public record Placed(SpaceApi.Placement placement) {}
}
