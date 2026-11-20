package io.space.concepts.pluginverification.application;

import io.space.concepts.pluginverification.api.*;
import io.space.concepts.pluginverification.api.PluginVerificationApi;
import io.space.concepts.pluginverification.application.ports.VerificationRepository;
import java.time.Clock;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

@Service
@Transactional
class PluginVerificationService implements PluginVerificationApi {
    private final VerificationRepository store;
    private final JsonMapper json;
    private final Clock clock;

    PluginVerificationService(VerificationRepository store, JsonMapper json, Clock clock) {
        this.store = store;
        this.json = json;
        this.clock = clock;
    }

    public Verification record(Input in, List<Check> checks) {
        var result = new Verification(
                UUID.randomUUID(),
                in.developmentId(),
                in.candidateId(),
                in.sourceDigest(),
                in.bundleDigest(),
                in.fixtureDigest(),
                in.environment(),
                in.browserEvidence(),
                new Evidence(checks.stream().allMatch(Check::passed), checks),
                false,
                clock.instant());
        store.insert(result.id(), result.developmentId(), json.writeValueAsString(result));
        return result;
    }

    public Optional<Verification> find(UUID id) {
        return store.find(id).map(v -> json.readValue(v, Verification.class));
    }

    public List<VerificationSummary> list(UUID development) {
        return store.list(development).stream()
                .map(v -> json.readValue(v, VerificationSummary.class))
                .toList();
    }
}
