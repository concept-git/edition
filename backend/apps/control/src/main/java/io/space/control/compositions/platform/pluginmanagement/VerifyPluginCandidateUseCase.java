package io.space.control.compositions.platform.pluginmanagement;

import static io.space.control.compositions.platform.pluginmanagement.PluginManagementTypes.*;

import io.space.control.compositions.flow.FlowResponse;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class VerifyPluginCandidateUseCase {
    private final PluginManagementOperations operations;

    VerifyPluginCandidateUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public FlowResponse<Verification> verifyPluginCandidate(
            String credential,
            UUID tenant,
            UUID developmentId,
            UUID candidateId,
            String fixtureDigest,
            String environment,
            Evidence browser,
            String key) {
        return operations.verify(
                credential, tenant, developmentId, candidateId, fixtureDigest, environment, browser, key);
    }
}
