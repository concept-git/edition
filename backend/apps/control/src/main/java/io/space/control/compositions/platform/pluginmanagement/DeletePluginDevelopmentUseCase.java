package io.space.control.compositions.platform.pluginmanagement;

import static io.space.control.compositions.platform.pluginmanagement.PluginManagementTypes.*;

import io.space.control.compositions.flow.FlowResponse;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class DeletePluginDevelopmentUseCase {
    private final PluginManagementOperations operations;

    DeletePluginDevelopmentUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public FlowResponse<Removed> deletePluginDevelopment(
            String credential, UUID tenant, UUID id, int base, String key) {
        return operations.delete(credential, tenant, id, base, key);
    }
}
