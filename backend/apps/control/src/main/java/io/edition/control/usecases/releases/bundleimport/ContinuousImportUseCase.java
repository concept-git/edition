package io.edition.control.usecases.releases.bundleimport;

import static io.edition.control.usecases.releases.bundleimport.BundleImportTypes.*;

import io.edition.control.modules.importjob.api.ImportJobApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.releases.release.ReleaseAccess;
import io.edition.control.usecases.releases.release.ReleaseProjection;
import java.util.UUID;
import java.util.function.Function;
import org.slf4j.MDC;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ContinuousImportUseCase {

    private final ImportEligibility importEligibility;
    private final io.edition.control.usecases.resource.ResourceWriteLocks locks;

    private final io.edition.control.modules.deletionrecovery.api.DeletionRecoveryApi operations;
    private final ReleaseApi releases;
    private final ImportJobApi jobs;
    private final TenantAccess tenants;

    private final ReleaseAccess access;
    private final ReleaseProjection projection;
    private final IdempotentFlowExecutor idempotency;
    private final ImportZipIngress ingress;

    private final ApplicationEventPublisher events;

    ContinuousImportUseCase(BundleImportDependencies dependencies) {
        this.importEligibility = dependencies.importEligibility;
        this.locks = dependencies.locks;
        this.operations = dependencies.operations;
        this.releases = dependencies.releases;
        this.jobs = dependencies.jobs;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
        this.ingress = dependencies.ingress;
        this.events = dependencies.events;
    }

    @Transactional
    public FlowResponse<ImportAccepted> continuousImport(
            String credential, UUID tenant, UUID space, ImportSource source, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.PUBLISH);
            String traceId = MDC.get("requestId");
            UUID actorId = access.actorId(resolution);
            String sourceUrl = source instanceof ImportSource.RemoteZip remote
                    ? remote.url().strip()
                    : null;
            // 受理的加锁段：互斥复检 → Release.draft → 入队；此时 zip 已落对象存储
            Function<ImportZipIngress.Stored, ImportAccepted> accept = stored -> tenants.inTenant(tenant, () -> {
                if (jobs.hasUnfinished(space)) throw new ImportInProgressException();
                operations.lockSpace(space);
                importEligibility.requireImportable(locks.space(tenant, space), space);
                ReleaseApi.View drafted = releases.draft(
                        new ReleaseApi.ScopeId(space),
                        new ReleaseApi.Source(ReleaseApi.SourceKind.IMPORT, stored.sha256(), actorId));
                ImportJobApi.View job =
                        jobs.enqueue(tenant, space, drafted.id(), stored.sha256(), stored.key(), traceId, sourceUrl);
                events.publishEvent(new ImportQueued(tenant, job.id()));
                return new ImportAccepted(JobView.of(job), projection.detail(drafted, resolution, tenant, owner));
            });
            if (sourceUrl != null) {
                // 远程拉取只在首次幂等执行中预检，已完成响应不受后续作业状态影响。
                // 指纹 = spaceId + url：同一地址即同一请求；内容是否变化由流水线 skip 判定。
                return idempotency.execute(
                        resolution.principal(),
                        key,
                        "release.import",
                        IdempotentFlowExecutor.canonical(space, "url", sourceUrl),
                        202,
                        ImportAccepted.class,
                        () -> {
                            // 下载期间持本空间的事务级 try-lock（与 worker 同一键）：并发的第二个受理或运行中的
                            // worker 让这里立刻 409，而不是双方都下载后才在加锁复检里出局
                            tenants.inTenant(tenant, () -> importEligibility.lockImportableSpace(tenant, space));
                            return accept.apply(ingress.admit(source));
                        });
            }
            try (var prepared = ingress.prepare(source)) {
                return idempotency.execute(
                        resolution.principal(),
                        key,
                        "release.import",
                        IdempotentFlowExecutor.canonical(
                                space, prepared.stored().sha256()),
                        202,
                        ImportAccepted.class,
                        () -> tenants.inTenant(tenant, () -> {
                            importEligibility.lockImportableSpace(tenant, space);
                            return accept.apply(ingress.store(prepared));
                        }));
            }
        }
    }
}
