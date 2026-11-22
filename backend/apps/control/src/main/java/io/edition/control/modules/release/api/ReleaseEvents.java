package io.edition.control.modules.release.api;

/** Release 状态变化事件，不点名其他概念。 */
public final class ReleaseEvents {
    private ReleaseEvents() {}

    public record Drafted(ReleaseApi.View release) {}

    public record Loaded(ReleaseApi.View release) {}

    public record Validated(ReleaseApi.View release) {}

    public record Flagged(ReleaseApi.View release) {}

    public record Promoted(ReleaseApi.View release) {}

    public record Discarded(ReleaseApi.ReleaseId release) {}

    public record Annotated(ReleaseApi.View release) {}

    public record ValidationRejected(ReleaseApi.View release) {}
}
