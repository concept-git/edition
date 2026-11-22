package io.edition.control.usecases.platform.pluginmanagement;

import static io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ViewPluginVerificationUseCase {
    private final PluginManagementOperations operations;

    ViewPluginVerificationUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public Verification viewPluginVerification(String credential, UUID tenant, UUID id) {
        return operations.verification(credential, tenant, id);
    }
}
