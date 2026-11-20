package io.space.concepts.permission.api;

import io.space.concepts.permission.api.PermissionApi.Principal;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.permission.api.PermissionApi.Role;

/**
 * Permission 动作的完成事件。事件只携带本概念的稳定值对象，不点名下游概念。
 */
public final class PermissionEvents {

    private PermissionEvents() {}

    public record RoleDefined(Role role) {}

    public record Granted(Resource resource, Principal principal, Role role) {}

    public record Revoked(Resource resource, Principal principal) {}

    public record Restricted(Resource resource) {}

    public record Unrestricted(Resource resource) {}

    public record ResourceCleared(Resource resource) {}

    public record PrincipalCleared(Principal principal) {}
}
