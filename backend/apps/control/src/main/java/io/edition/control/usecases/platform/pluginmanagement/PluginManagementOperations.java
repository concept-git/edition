package io.edition.control.usecases.platform.pluginmanagement;

import io.edition.control.modules.contenttype.api.ContentTypeApi;
import io.edition.control.modules.plugindevelopment.api.PluginDevelopmentApi;
import io.edition.control.modules.pluginverification.api.PluginVerificationApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.usecases.access.*;
import io.edition.control.usecases.flow.*;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;
import io.edition.shared.*;
import java.util.*;
import java.util.function.Supplier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

@Service
@Transactional
class PluginManagementOperations {
    private final ContentTypeApi catalog;
    private final PluginDevelopmentApi developments;
    private final PluginVerificationApi verification;
    private final ReleaseApi releases;
    private final TenantAccess tenants;
    private final IdempotentFlowExecutor idempotency;
    private final JsonMapper json;

    PluginManagementOperations(
            ContentTypeApi catalog,
            PluginDevelopmentApi developments,
            PluginVerificationApi verification,
            ReleaseApi releases,
            TenantAccess tenants,
            IdempotentFlowExecutor idempotency,
            JsonMapper json) {
        this.catalog = catalog;
        this.developments = developments;
        this.verification = verification;
        this.releases = releases;
        this.tenants = tenants;
        this.idempotency = idempotency;
        this.json = json;
    }

    public Catalog catalog(String credential, UUID tenant) {
        var who = tenants.admitUser(credential, tenant);
        return tenants.inTenant(
                tenant,
                () -> new Catalog(
                        catalog.implementations().stream()
                                .map(e -> new Descriptor(
                                        e.id(),
                                        e.name(),
                                        e.version(),
                                        e.contentTypes(),
                                        e.formats(),
                                        e.capabilities(),
                                        e.trusted()))
                                .toList(),
                        "build-time-only",
                        tenants.allows(who, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN)));
    }

    public DevelopmentList list(String credential, UUID tenant) {
        return read(
                credential,
                tenant,
                () -> new DevelopmentList(developments.list().stream()
                        .map(this::developmentSummary)
                        .toList()));
    }

    public Development view(String credential, UUID tenant, UUID id) {
        return read(
                credential,
                tenant,
                () -> development(developments.find(id).orElseThrow(PluginDevelopmentApi.Missing::new)));
    }

    public FlowResponse<Development> create(
            String credential, UUID tenant, String name, String type, Source source, String key) {
        return write(
                credential,
                tenant,
                key,
                "plugin.development.create",
                IdempotentFlowExecutor.canonical(name, type, canonicalSource(source)),
                201,
                Development.class,
                () -> development(developments.create(name, type, toSource(source))));
    }

    public FlowResponse<Development> save(
            String credential, UUID tenant, UUID id, int base, String name, String type, Source source, String key) {
        return write(
                credential,
                tenant,
                key,
                "plugin.development.save",
                IdempotentFlowExecutor.canonical(id, base, name, type, canonicalSource(source)),
                200,
                Development.class,
                () -> development(developments.save(id, base, name, type, toSource(source))));
    }

    public FlowResponse<Removed> delete(String credential, UUID tenant, UUID id, int base, String key) {
        return write(
                credential,
                tenant,
                key,
                "plugin.development.delete",
                IdempotentFlowExecutor.canonical(id, base),
                200,
                Removed.class,
                () -> {
                    developments.delete(id, base);
                    return new Removed(id);
                });
    }

    public FlowResponse<Candidate> compile(
            String credential,
            UUID tenant,
            UUID id,
            int base,
            String digest,
            String entry,
            String bundle,
            String environment,
            String key) {
        return write(
                credential,
                tenant,
                key,
                "plugin.development.compile",
                IdempotentFlowExecutor.canonical(id, base, digest, entry, bundle, environment),
                201,
                Candidate.class,
                () -> candidate(developments.compile(id, base, digest, entry, bundle, environment)));
    }

    public CandidateList candidates(String credential, UUID tenant, UUID id) {
        return read(
                credential,
                tenant,
                () -> new CandidateList(developments.candidates(id).stream()
                        .map(this::candidateSummary)
                        .toList()));
    }

    public Candidate candidate(String credential, UUID tenant, UUID id, UUID candidateId) {
        return read(
                credential,
                tenant,
                () -> candidate(
                        developments.candidate(id, candidateId).orElseThrow(PluginDevelopmentApi.Missing::new)));
    }

    public FlowResponse<Verification> verify(
            String credential,
            UUID tenant,
            UUID developmentId,
            UUID candidateId,
            String fixtureDigest,
            String environment,
            Evidence browser,
            String key) {
        return write(
                credential,
                tenant,
                key,
                "plugin.verification.run",
                IdempotentFlowExecutor.canonical(
                        developmentId, candidateId, fixtureDigest, environment, json.writeValueAsString(browser)),
                201,
                Verification.class,
                () -> {
                    var c = developments
                            .candidate(developmentId, candidateId)
                            .orElseThrow(PluginDevelopmentApi.Missing::new);
                    if (!Objects.equals(c.environment(), environment))
                        throw new Invalid("environment", "environment_mismatch");
                    if (!Sha256.hex(c.source().fixtures()).equals(fixtureDigest))
                        throw new Invalid("fixtureDigest", "digest_mismatch");
                    if (browser == null
                            || browser.checks() == null
                            || browser.checks().size() > 500) throw new Invalid("browserEvidence", "invalid_evidence");
                    for (var check : browser.checks())
                        if (check == null
                                || check.name() == null
                                || check.name().isBlank()
                                || check.name().length() > 200
                                || (check.message() != null && check.message().length() > 1000))
                            throw new Invalid("browserEvidence", "invalid_check");
                    var checks = new ArrayList<PluginVerificationApi.Check>();
                    checks.add(new PluginVerificationApi.Check(
                            "bundle_digest",
                            Sha256.hex(c.bundle()).equals(c.bundleDigest()),
                            "Server recomputed the stored artifact digest."));
                    var manifest = json.readTree(c.source().manifest());
                    checks.addAll(PluginManifestChecks.inspect(manifest));
                    checks.addAll(PluginFixtureChecks.inspect(
                            manifest,
                            json.readTree(c.source().configuration()),
                            json.readTree(c.source().fixtures()),
                            catalog,
                            releases,
                            json));
                    var input = new PluginVerificationApi.Input(
                            developmentId,
                            candidateId,
                            c.sourceDigest(),
                            c.bundleDigest(),
                            fixtureDigest,
                            environment,
                            toEvidence(browser));
                    return verification(verification.record(input, checks));
                });
    }

    public VerificationList verifications(String credential, UUID tenant, UUID id) {
        return read(
                credential,
                tenant,
                () -> new VerificationList(verification.list(id).stream()
                        .map(this::verificationSummary)
                        .toList()));
    }

    public Verification verification(String credential, UUID tenant, UUID id) {
        return read(
                credential,
                tenant,
                () -> verification(verification.find(id).orElseThrow(PluginDevelopmentApi.Missing::new)));
    }

    private <T> T read(String credential, UUID tenant, Supplier<T> work) {
        tenants.admitUser(credential, tenant);
        return tenants.inTenant(tenant, () -> translate(work));
    }

    private <T> FlowResponse<T> write(
            String credential,
            UUID tenant,
            String key,
            String operation,
            String fingerprint,
            int status,
            Class<T> type,
            Supplier<T> work) {
        var who = tenants.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        return idempotency.execute(
                who.principal(),
                key,
                operation,
                tenant + "|" + fingerprint,
                status,
                type,
                () -> tenants.inTenant(tenant, () -> translate(work)));
    }

    private <T> T translate(Supplier<T> work) {
        try {
            return work.get();
        } catch (PluginDevelopmentApi.Invalid e) {
            throw new Invalid(e.field, e.reason);
        } catch (PluginDevelopmentApi.Conflict e) {
            throw new Conflict(e.revision);
        } catch (PluginDevelopmentApi.Missing e) {
            throw new OperationNotFoundException();
        }
    }

    private PluginDevelopmentApi.Source toSource(Source s) {
        if (s == null) throw new Invalid("source", "required");
        return new PluginDevelopmentApi.Source(
                s.files(), s.manifest(), s.configuration(), s.fixtures(), s.dependencyLock(), s.baselineRef());
    }

    private String canonicalSource(Source source) {
        return source == null ? null : json.writeValueAsString(toSource(source));
    }

    private Source source(PluginDevelopmentApi.Source s) {
        return new Source(
                s.files(), s.manifest(), s.configuration(), s.fixtures(), s.dependencyLock(), s.baselineRef());
    }

    private Development development(PluginDevelopmentApi.Development d) {
        return new Development(
                d.id(),
                d.name(),
                d.contentType(),
                d.revision(),
                source(d.source()),
                d.sourceDigest(),
                d.createdAt(),
                d.updatedAt());
    }

    private Candidate candidate(PluginDevelopmentApi.Candidate c) {
        return new Candidate(
                c.id(),
                c.developmentId(),
                c.sourceRevision(),
                c.sourceDigest(),
                c.bundleDigest(),
                c.entryPoint(),
                c.bundle(),
                c.environment(),
                source(c.source()),
                c.createdAt());
    }

    private DevelopmentSummary developmentSummary(PluginDevelopmentApi.DevelopmentSummary d) {
        return new DevelopmentSummary(
                d.id(), d.name(), d.contentType(), d.revision(), d.sourceDigest(), d.createdAt(), d.updatedAt());
    }

    private CandidateSummary candidateSummary(PluginDevelopmentApi.CandidateSummary c) {
        return new CandidateSummary(
                c.id(),
                c.developmentId(),
                c.sourceRevision(),
                c.sourceDigest(),
                c.bundleDigest(),
                c.entryPoint(),
                c.environment(),
                c.createdAt());
    }

    private PluginVerificationApi.Evidence toEvidence(Evidence e) {
        return new PluginVerificationApi.Evidence(
                e.passed(),
                e.checks().stream()
                        .map(c -> new PluginVerificationApi.Check(c.name(), c.passed(), c.message()))
                        .toList());
    }

    private Evidence evidence(PluginVerificationApi.Evidence e) {
        return new Evidence(
                e.passed(),
                e.checks().stream()
                        .map(c -> new Check(c.name(), c.passed(), c.message()))
                        .toList());
    }

    private Verification verification(PluginVerificationApi.Verification v) {
        return new Verification(
                v.id(),
                v.developmentId(),
                v.candidateId(),
                v.sourceDigest(),
                v.bundleDigest(),
                v.fixtureDigest(),
                v.environment(),
                evidence(v.browserEvidence()),
                evidence(v.serverValidation()),
                false,
                v.createdAt());
    }

    private VerificationSummary verificationSummary(PluginVerificationApi.VerificationSummary v) {
        return new VerificationSummary(
                v.id(),
                v.developmentId(),
                v.candidateId(),
                v.sourceDigest(),
                v.bundleDigest(),
                v.fixtureDigest(),
                v.environment(),
                v.browserPassed(),
                v.serverPassed(),
                false,
                v.createdAt());
    }

    public static final class Invalid extends FlowException {
        public Invalid(String field, String reason) {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, reason)));
        }
    }

    public static final class Conflict extends FlowException {
        public Conflict(int revision) {
            super(
                    ProblemCode.EDIT_CONFLICT,
                    List.of(new ValidationViolation("baseRevision", "current_revision_" + revision)));
        }
    }
}
