package io.space.control.compositions.platform.pluginmanagement;

import static io.space.control.compositions.platform.pluginmanagement.PluginManagementTypes.*;

import java.util.*;

@org.springframework.stereotype.Component
final class PluginManagementDependencies {
    final PluginManagementOperations operations;

    public PluginManagementDependencies(PluginManagementOperations operations) {
        this.operations = operations;
    }
}
