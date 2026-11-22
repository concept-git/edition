package io.edition.control.usecases.platform.pluginmanagement;

import static io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ListPluginVerificationsUseCase {
    private final PluginManagementOperations operations;

    ListPluginVerificationsUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public VerificationList listPluginVerifications(String credential, UUID tenant, UUID id) {
        return operations.verifications(credential, tenant, id);
    }
}
