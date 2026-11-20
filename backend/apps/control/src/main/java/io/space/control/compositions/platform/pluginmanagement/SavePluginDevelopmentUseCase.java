package io.space.control.compositions.platform.pluginmanagement;

import static io.space.control.compositions.platform.pluginmanagement.PluginManagementTypes.*;

import io.space.control.compositions.flow.FlowResponse;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class SavePluginDevelopmentUseCase {
    private final PluginManagementOperations operations;

    SavePluginDevelopmentUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public FlowResponse<Development> savePluginDevelopment(
            String credential, UUID tenant, UUID id, int base, String name, String type, Source source, String key) {
        return operations.save(credential, tenant, id, base, name, type, source, key);
    }
}
