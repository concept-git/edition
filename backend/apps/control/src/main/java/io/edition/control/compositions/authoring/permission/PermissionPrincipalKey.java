package io.edition.control.compositions.authoring.permission;

import io.edition.concepts.permission.api.PermissionApi;
import java.util.Locale;
import java.util.UUID;

/** HTTP compound principal key ↔ Permission stable identity。 */
final class PermissionPrincipalKey {
    private PermissionPrincipalKey() {}

    static PermissionApi.Principal parse(String key) {
        if (key == null) {
            throw new PermissionInputInvalidException("principalKey", "required");
        }
        String normalized = key.strip().toLowerCase(Locale.ROOT);
        if (normalized.equals("anonymous")) {
            return PermissionApi.Principal.anonymous();
        }
        int separator = normalized.indexOf(':');
        if (separator < 1 || separator == normalized.length() - 1) {
            throw new PermissionInputInvalidException("principalKey", "invalid_format");
        }
        try {
            var type =
                    switch (normalized.substring(0, separator)) {
                        case "user" -> PermissionApi.PrincipalType.USER;
                        case "team" -> PermissionApi.PrincipalType.TEAM;
                        case "token" -> PermissionApi.PrincipalType.TOKEN;
                        default -> throw new IllegalArgumentException("unknown principal type");
                    };
            return new PermissionApi.Principal(type, UUID.fromString(normalized.substring(separator + 1)));
        } catch (IllegalArgumentException invalid) {
            throw new PermissionInputInvalidException("principalKey", "invalid_format");
        }
    }

    static String format(PermissionApi.Principal principal) {
        if (principal.type() == PermissionApi.PrincipalType.ANONYMOUS) {
            return "anonymous";
        }
        return principal.type().value() + ":" + principal.id();
    }
}
