package io.edition.control.usecases.platform.operations;

import static io.edition.control.usecases.platform.operations.OperationsTypes.*;

import io.edition.control.modules.audit.api.AuditApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import io.edition.control.usecases.access.TenantAccess;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DownloadAuditExportUseCase {

    private final io.edition.control.modules.audit.api.AuditExportsApi exports;
    private final io.edition.control.modules.objectstore.api.ObjectStoreApi objects;
    private final Clock clock;

    private final AuditApi audit;

    private final TenantAccess tenants;

    private final PlatformOperatorGuard operators;

    DownloadAuditExportUseCase(OperationsDependencies dependencies) {
        this.exports = dependencies.exports;
        this.objects = dependencies.objects;
        this.clock = dependencies.clock;
        this.audit = dependencies.audit;
        this.tenants = dependencies.tenants;
        this.operators = dependencies.operators;
    }

    @Transactional(readOnly = true)
    public ExportContent downloadAuditExport(String credential, UUID tenant, UUID id) {
        if (tenant == null) operators.require(credential);
        else tenants.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        java.util.function.Supplier<ExportContent> query = () -> {
            var entry = exports.view(id)
                    .filter(e -> Objects.equals(e.tenantId(), tenant)
                            && e.expiresAt().isAfter(clock.instant()))
                    .orElseThrow(io.edition.control.usecases.flow.OperationNotFoundException::new);
            if (!entry.status().equals("completed") || entry.objectKey() == null)
                throw new io.edition.control.usecases.authoring.termination.TerminationErrors.Busy();
            return new ExportContent(
                    objects.open(entry.objectKey())
                            .orElseThrow(
                                    () -> new io.edition.control.modules.objectstore.api.ObjectStoreApi.Unavailable(
                                            "export object unavailable", null)),
                    "audit-" + id + ".csv");
        };
        return tenant == null ? query.get() : tenants.inTenant(tenant, query);
    }
}
