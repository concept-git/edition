package io.edition.control.compositions.releases.bundleimport;

import static io.edition.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.edition.concepts.importjob.api.ImportJobApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.releases.release.ReleaseAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewImportJobUseCase {

    private final ImportJobApi jobs;
    private final TenantAccess tenants;

    private final ReleaseAccess access;

    ViewImportJobUseCase(BundleImportDependencies dependencies) {
        this.jobs = dependencies.jobs;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
    }

    @Transactional(readOnly = true)
    public JobView viewImportJob(String credential, UUID tenant, UUID space, UUID jobId) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            access.space(tenant, space);
            access.require(credential, tenant, space, TenantAccess.READ);
            return tenants.inTenant(
                    tenant,
                    () -> JobView.of(jobs.viewBySpace(space, jobId).orElseThrow(ImportJobNotFoundException::new)));
        }
    }
}
