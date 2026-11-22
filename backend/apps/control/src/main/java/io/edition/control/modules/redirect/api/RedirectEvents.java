package io.edition.control.modules.redirect.api;

/** Redirect 状态变化事件，不点名其他概念。 */
public final class RedirectEvents {
    private RedirectEvents() {}

    public record Registered(RedirectApi.Rule rule) {}

    public record Retired(RedirectApi.ScopeId scope, String path) {}
}
