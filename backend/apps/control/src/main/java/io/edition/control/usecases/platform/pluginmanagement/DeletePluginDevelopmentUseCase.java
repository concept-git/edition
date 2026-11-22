package io.edition.control.usecases.platform.pluginmanagement;

import static io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;

import io.edition.control.usecases.flow.FlowResponse;
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
