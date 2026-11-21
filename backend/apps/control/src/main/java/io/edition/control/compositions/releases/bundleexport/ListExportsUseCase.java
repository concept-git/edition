package io.edition.control.compositions.releases.bundleexport;

import static io.edition.control.compositions.releases.bundleexport.BundleExportTypes.*;

import io.edition.concepts.bundleexport.api.*;
import io.edition.concepts.objectstore.api.*;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListExportsUseCase {

    private final BundleExportAccess access;

    private final TenantAccess tenants;

    private final BundleExportJobs jobs;

    private final BundleExportProjection projection;

    ListExportsUseCase(BundleExportDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.jobs = dependencies.jobs;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public Jobs listExports(String credential, UUID tenant, UUID space, UUID release, String cursor, int limit) {
        access.require(credential, tenant, space);
        return tenants.inTenant(tenant, () -> {
            BundleExportJobs.Page result;
            try {
                result = jobs.list(space, release, cursor, limit);
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            return new Jobs(result.items().stream().map(projection::job).toList(), result.nextCursor());
        });
    }
}
