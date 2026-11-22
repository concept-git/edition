package io.edition.control.usecases.access;

public final class ManagementScopeCatalog {
    private ManagementScopeCatalog() {}

    public static java.util.List<String> values() {
        return java.util.Arrays.stream(io.edition.control.modules.managementtoken.api.ManagementTokenApi.Scope.values())
                .map(io.edition.control.modules.managementtoken.api.ManagementTokenApi.Scope::value)
                .toList();
    }
}
