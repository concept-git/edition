package io.space.control.compositions.platform.pluginmanagement;

import static io.space.control.compositions.platform.pluginmanagement.PluginManagementTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ViewPluginCandidateUseCase {
    private final PluginManagementOperations operations;

    ViewPluginCandidateUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public Candidate viewPluginCandidate(String credential, UUID tenant, UUID id, UUID candidateId) {
        return operations.candidate(credential, tenant, id, candidateId);
    }
}
