package io.space.control.compositions.platform.operations;

import static io.space.control.compositions.platform.operations.OperationsTypes.*;

import io.space.concepts.audit.api.AuditApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.control.compositions.*;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ExportAuditUseCase {

    private final io.space.concepts.audit.api.AuditExportsApi exports;

    private final Clock clock;

    private final AuditApi audit;

    private final TenantAccess tenants;

    private final PlatformOperatorGuard operators;

    private final IdempotentFlowExecutor idempotency;

    ExportAuditUseCase(OperationsDependencies dependencies) {
        this.exports = dependencies.exports;
        this.clock = dependencies.clock;
        this.audit = dependencies.audit;
        this.tenants = dependencies.tenants;
        this.operators = dependencies.operators;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<ExportStatus> exportAudit(String credential, UUID tenant, AuditFilter filter, String key) {
        UUID actor = tenant == null
                ? operators.require(credential).value()
                : tenants.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN)
                        .principal()
                        .id();
        var principal = new PermissionApi.Principal(PermissionApi.PrincipalType.USER, actor);
        var selected = new AuditApi.Filter(
                filter.actor(),
                filter.action(),
                filter.target(),
                filter.outcome(),
                filter.from(),
                filter.to(),
                null,
                tenant == null);
        return idempotency.execute(
                principal,
                key,
                "audit.export",
                IdempotentFlowExecutor.canonical(tenant, selected),
                202,
                ExportStatus.class,
                () -> {
                    java.util.function.Supplier<ExportStatus> create = () -> {
                        var entry = exports.create(tenant, actor, selected, clock.instant());
                        var c = RequestAuditContext.current();
                        audit.append(new AuditApi.Event(
                                tenant,
                                UUID.randomUUID(),
                                c.rootId(),
                                "fact",
                                "user",
                                actor,
                                "Audit.export",
                                "audit_export",
                                entry.id(),
                                "ok",
                                c.ip(),
                                c.requestId()));
                        return ExportStatus.of(entry);
                    };
                    return tenant == null ? create.get() : tenants.inTenant(tenant, create);
                });
    }
}
