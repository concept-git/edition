package io.edition.control.compositions.platform.pluginmanagement;

import static io.edition.control.compositions.platform.pluginmanagement.PluginManagementTypes.*;

import io.edition.control.compositions.flow.FlowResponse;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class CreatePluginDevelopmentUseCase {
    private final PluginManagementOperations operations;

    CreatePluginDevelopmentUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public FlowResponse<Development> createPluginDevelopment(
            String credential, UUID tenant, String name, String type, Source source, String key) {
        return operations.create(credential, tenant, name, type, source, key);
    }
}
