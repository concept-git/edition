package io.space.control.compositions.platform.operations;

import static io.space.control.compositions.platform.operations.OperationsTypes.*;

import io.space.concepts.audit.api.AuditApi;
import io.space.concepts.importjob.api.ImportJobApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.control.compositions.*;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceArchivedException;
import io.space.control.compositions.resource.SpaceModeRestrictedException;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RetryJobUseCase {

    private final AuditApi audit;
    private final ImportJobApi jobs;
    private final TenantAccess tenants;

    private final PlatformOperatorGuard operators;
    private final ResourceChain resources;

    private final ReleaseApi releases;
    private final IdempotentFlowExecutor idempotency;

    RetryJobUseCase(OperationsDependencies dependencies) {
        this.audit = dependencies.audit;
        this.jobs = dependencies.jobs;
        this.tenants = dependencies.tenants;
        this.operators = dependencies.operators;
        this.resources = dependencies.resources;
        this.releases = dependencies.releases;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public void retryJob(String credential, UUID tenant, UUID id, String key, boolean platform) {
        var principal = platform
                ? new PermissionApi.Principal(
                        PermissionApi.PrincipalType.USER,
                        operators.require(credential).value())
                : tenants.admitUser(credential, tenant).principal();
        idempotency.execute(
                principal,
                key,
                "job.retry",
                IdempotentFlowExecutor.canonical(tenant, id),
                () -> tenants.inTenant(tenant, () -> {
                    var job = jobs.view(id).orElseThrow(SpaceNotFoundException::new);
                    if (!jobs.tryAdvisoryLock(job.spaceId()))
                        throw new io.space.control.compositions.authoring.termination.TerminationErrors.Busy();
                    job = jobs.view(id).orElseThrow(SpaceNotFoundException::new);
                    var space = resources.space(tenant, job.spaceId()).orElseThrow(SpaceNotFoundException::new);
                    if (!platform)
                        tenants.requireUser(
                                credential,
                                tenant,
                                List.of(TenantAccess.tenant(tenant), TenantAccess.space(space.id())),
                                TenantAccess.PUBLISH);
                    if (space.status() != io.space.concepts.space.api.SpaceApi.Status.ACTIVE)
                        throw new SpaceArchivedException();
                    if (space.mode() != io.space.concepts.space.api.SpaceApi.Mode.SYNCED)
                        throw new SpaceModeRestrictedException();
                    if (jobs.hasUnfinished(space.id()))
                        throw new io.space.control.compositions.authoring.termination.TerminationErrors.Busy();
                    var release = releases.status(new ReleaseApi.ReleaseId(job.releaseId()));
                    if (release.isEmpty() || release.orElseThrow() != ReleaseApi.Status.DRAFT)
                        throw new io.space.control.compositions.authoring.termination.TerminationErrors.Busy();
                    if (!jobs.retryFailed(id))
                        throw new io.space.control.compositions.authoring.termination.TerminationErrors.Busy();
                    var ctx = RequestAuditContext.current();
                    var evidence = new AuditApi.Event(
                            platform ? null : tenant,
                            UUID.randomUUID(),
                            ctx.rootId(),
                            "fact",
                            "user",
                            principal.id(),
                            "Operations.retry",
                            "job",
                            id,
                            "ok",
                            ctx.ip(),
                            ctx.requestId());
                    if (platform) audit.appendPlatform(evidence);
                    else audit.append(evidence);
                }));
    }
}
