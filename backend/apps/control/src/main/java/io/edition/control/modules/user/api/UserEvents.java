package io.edition.control.modules.user.api;

import io.edition.control.modules.user.api.UserApi.UserId;

/**
 * User 动作的完成事件。事件只携带本概念的稳定值对象，不点名下游概念，也不携带令牌明文。
 */
public final class UserEvents {

    private UserEvents() {}

    public record Registered(UserId user, String email, String name) {}

    public record Verified(UserId user) {}

    public record Deactivated(UserId user) {}

    public record Erased(UserId user) {}
}
