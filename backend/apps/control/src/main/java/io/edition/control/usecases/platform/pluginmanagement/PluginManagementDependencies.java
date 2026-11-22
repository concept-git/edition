package io.edition.control.usecases.platform.pluginmanagement;

import static io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;

import java.util.*;

@org.springframework.stereotype.Component
final class PluginManagementDependencies {
    final PluginManagementOperations operations;

    public PluginManagementDependencies(PluginManagementOperations operations) {
        this.operations = operations;
    }
}
