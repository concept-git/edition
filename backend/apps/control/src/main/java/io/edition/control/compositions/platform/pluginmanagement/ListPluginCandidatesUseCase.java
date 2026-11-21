package io.edition.control.compositions.platform.pluginmanagement;

import static io.edition.control.compositions.platform.pluginmanagement.PluginManagementTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ListPluginCandidatesUseCase {
    private final PluginManagementOperations operations;

    ListPluginCandidatesUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public CandidateList listPluginCandidates(String credential, UUID tenant, UUID id) {
        return operations.candidates(credential, tenant, id);
    }
}
