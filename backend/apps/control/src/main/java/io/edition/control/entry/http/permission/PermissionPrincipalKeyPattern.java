package io.edition.control.entry.http.permission;

/** Bean Validation 的 compound principal-key grammar；语义解析仍由 permission flow 拥有。 */
final class PermissionPrincipalKeyPattern {
    static final String VALUE = "(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-"
            + "[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous";

    private PermissionPrincipalKeyPattern() {}
}
