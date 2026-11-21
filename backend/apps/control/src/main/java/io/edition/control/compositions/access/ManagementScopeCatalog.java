package io.edition.control.compositions.access;

public final class ManagementScopeCatalog {
    private ManagementScopeCatalog() {}

    public static java.util.List<String> values() {
        return java.util.Arrays.stream(io.edition.concepts.managementtoken.api.ManagementTokenApi.Scope.values())
                .map(io.edition.concepts.managementtoken.api.ManagementTokenApi.Scope::value)
                .toList();
    }
}
