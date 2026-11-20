package io.space.control.compositions.platform.operations;

import static io.space.control.compositions.platform.operations.OperationsTypes.*;

import io.space.concepts.importjob.api.ImportJobApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.control.compositions.*;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListJobsUseCase {

    private final ImportJobApi jobs;
    private final TenantAccess tenants;
    private final TenantRegistryApi registry;
    private final PlatformOperatorGuard operators;
    private final ResourceChain resources;

    ListJobsUseCase(OperationsDependencies dependencies) {
        this.jobs = dependencies.jobs;
        this.tenants = dependencies.tenants;
        this.registry = dependencies.registry;
        this.operators = dependencies.operators;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public JobPage listJobs(String credential, UUID tenant, UUID space, String status, UUID cursor, int limit) {
        if (limit < 1 || limit > 100) throw new InvalidCursorException();
        if (status != null
                && !Set.of("queued", "running", "retrying", "held", "failed", "completed")
                        .contains(status)) throw new InvalidCursorException();
        var result = new ArrayList<Job>();
        if (tenant == null) {
            operators.require(credential);
            String tenantCursor = null;
            do {
                var batch = registry.list(tenantCursor, 100);
                for (var t : batch.tenants())
                    tenants.inTenant(
                            t.id().value(),
                            () -> jobs.list(cursor, null, status, limit + 1)
                                    .forEach(j -> result.add(Job.of(
                                            j,
                                            j.status().equals("failed") && !"resource_deleted".equals(j.outcome())))));
                tenantCursor = batch.nextCursor();
            } while (tenantCursor != null);
        } else {
            var chain = space == null
                    ? List.of(TenantAccess.tenant(tenant))
                    : List.of(TenantAccess.tenant(tenant), TenantAccess.space(space));
            if (space != null) resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
            var who = tenants.requireUser(credential, tenant, chain, TenantAccess.ADMIN);
            tenants.inTenant(
                    tenant,
                    () -> jobs.list(cursor, space, status, limit + 1)
                            .forEach(j -> result.add(Job.of(
                                    j,
                                    j.releaseId() != null
                                            && j.zipKey() != null
                                            && j.status().equals("failed")
                                            && !"resource_deleted".equals(j.outcome())
                                            && tenants.allows(
                                                    who,
                                                    tenant,
                                                    List.of(
                                                            TenantAccess.tenant(tenant),
                                                            TenantAccess.space(j.spaceId())),
                                                    TenantAccess.PUBLISH)))));
        }
        result.sort(Comparator.comparing(Job::id).reversed());
        Long total = tenant == null ? null : tenants.inTenant(tenant, () -> jobs.count(space, status));
        return new JobPage(
                result.size() > limit ? List.copyOf(result.subList(0, limit)) : List.copyOf(result),
                result.size() > limit ? result.get(limit - 1).id() : null,
                total);
    }
}
