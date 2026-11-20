package io.space.control.compositions.releases.bundleexport;

import static io.space.control.compositions.releases.bundleexport.BundleExportTypes.*;

import io.space.concepts.bundleexport.api.*;
import io.space.concepts.objectstore.api.*;
import io.space.control.compositions.access.TenantAccess;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewExportUseCase {

    private final BundleExportAccess access;

    private final TenantAccess tenants;

    private final BundleExportJobs jobs;

    private final BundleExportProjection projection;

    ViewExportUseCase(BundleExportDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.jobs = dependencies.jobs;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public Job viewExport(String credential, UUID tenant, UUID space, UUID id) {
        access.require(credential, tenant, space);
        return tenants.inTenant(
                tenant, () -> projection.job(jobs.view(space, id).orElseThrow(ExportProblem::notFound)));
    }
}
