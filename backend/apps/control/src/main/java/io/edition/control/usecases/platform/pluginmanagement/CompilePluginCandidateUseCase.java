package io.edition.control.usecases.platform.pluginmanagement;

import static io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;

import io.edition.control.usecases.flow.FlowResponse;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class CompilePluginCandidateUseCase {
    private final PluginManagementOperations operations;

    CompilePluginCandidateUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public FlowResponse<Candidate> compilePluginCandidate(
            String credential,
            UUID tenant,
            UUID id,
            int base,
            String digest,
            String entry,
            String bundle,
            String environment,
            String key) {
        return operations.compile(credential, tenant, id, base, digest, entry, bundle, environment, key);
    }
}
