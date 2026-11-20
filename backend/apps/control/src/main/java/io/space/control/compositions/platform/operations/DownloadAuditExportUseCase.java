package io.space.control.compositions.platform.operations;

import static io.space.control.compositions.platform.operations.OperationsTypes.*;

import io.space.concepts.audit.api.AuditApi;
import io.space.control.compositions.*;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.access.TenantAccess;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DownloadAuditExportUseCase {

    private final io.space.concepts.audit.api.AuditExportsApi exports;
    private final io.space.concepts.objectstore.api.ObjectStoreApi objects;
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
                    .orElseThrow(io.space.control.compositions.flow.OperationNotFoundException::new);
            if (!entry.status().equals("completed") || entry.objectKey() == null)
                throw new io.space.control.compositions.authoring.termination.TerminationErrors.Busy();
            return new ExportContent(
                    objects.open(entry.objectKey())
                            .orElseThrow(() -> new io.space.concepts.objectstore.api.ObjectStoreApi.Unavailable(
                                    "export object unavailable", null)),
                    "audit-" + id + ".csv");
        };
        return tenant == null ? query.get() : tenants.inTenant(tenant, query);
    }
}
