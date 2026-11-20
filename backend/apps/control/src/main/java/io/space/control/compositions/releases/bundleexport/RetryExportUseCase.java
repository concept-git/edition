package io.space.control.compositions.releases.bundleexport;

import static io.space.control.compositions.releases.bundleexport.BundleExportTypes.*;

import io.space.concepts.bundleexport.api.*;
import io.space.concepts.objectstore.api.*;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RetryExportUseCase {

    private final BundleExportAccess access;

    private final TenantAccess tenants;

    private final BundleExportJobs jobs;

    private final IdempotentFlowExecutor idempotency;
    private final BundleExportProjection projection;

    RetryExportUseCase(BundleExportDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.jobs = dependencies.jobs;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<Job> retryExport(String credential, UUID tenant, UUID space, UUID id, String key) {
        var actor = access.require(credential, tenant, space);
        return tenants.inTenant(tenant, () -> {
            var job = jobs.find(space, id).orElseThrow(ExportProblem::notFound);
            if (job.view().status().equals("expired")) throw ExportProblem.expired();
            if (job.view().status().equals("cancelled")) throw ExportProblem.notFound();
            access.requirePages(actor, tenant, job.pageIds());
            return idempotency.execute(
                    actor.principal(),
                    key,
                    "bundle.export.retry",
                    IdempotentFlowExecutor.canonical(tenant, space, id),
                    200,
                    Job.class,
                    () -> {
                        jobs.retry(space, id);
                        return projection.job(jobs.view(space, id).orElseThrow(ExportProblem::notFound));
                    });
        });
    }
}
