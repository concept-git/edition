package io.edition.control.usecases.platform.pluginmanagement;

import static io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ListPluginDevelopmentsUseCase {
    private final PluginManagementOperations operations;

    ListPluginDevelopmentsUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public DevelopmentList listPluginDevelopments(String credential, UUID tenant) {
        return operations.list(credential, tenant);
    }
}
