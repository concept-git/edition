package io.edition.control.modules.session.api;

public final class SessionEvents {
    private SessionEvents() {}

    public record Changed(SessionApi.SessionId session) {}

    public record HolderChanged(SessionApi.HolderId holder) {}
}
