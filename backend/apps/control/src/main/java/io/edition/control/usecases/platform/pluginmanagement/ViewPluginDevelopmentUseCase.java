package io.edition.control.usecases.platform.pluginmanagement;

import static io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ViewPluginDevelopmentUseCase {
    private final PluginManagementOperations operations;

    ViewPluginDevelopmentUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public Development viewPluginDevelopment(String credential, UUID tenant, UUID id) {
        return operations.view(credential, tenant, id);
    }
}
