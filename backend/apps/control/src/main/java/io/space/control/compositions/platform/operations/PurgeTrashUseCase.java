package io.space.control.compositions.platform.operations;

import static io.space.control.compositions.platform.operations.OperationsTypes.*;

import io.space.concepts.audit.api.AuditApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.control.compositions.*;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.authoring.termination.ExpiredTrashPurge;
import io.space.control.compositions.authoring.termination.TerminationTypes;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PurgeTrashUseCase {

    private final AuditApi audit;

    private final PlatformOperatorGuard operators;

    private final IdempotentFlowExecutor idempotency;
    private final ExpiredTrashPurge expiredTrashPurge;

    PurgeTrashUseCase(OperationsDependencies dependencies) {
        this.audit = dependencies.audit;
        this.operators = dependencies.operators;
        this.idempotency = dependencies.idempotency;
        this.expiredTrashPurge = dependencies.expiredTrashPurge;
    }

    @Transactional
    public FlowResponse<TerminationTypes.PurgeReport> purgeTrash(String credential, UUID tenant, String key) {
        var operator = operators.require(credential);
        return idempotency.execute(
                new PermissionApi.Principal(PermissionApi.PrincipalType.USER, operator.value()),
                key,
                "trash.scan",
                IdempotentFlowExecutor.canonical(tenant),
                200,
                TerminationTypes.PurgeReport.class,
                () -> {
                    var report = expiredTrashPurge.scan(tenant);
                    var ctx = RequestAuditContext.current();
                    audit.append(new AuditApi.Event(
                            null,
                            UUID.randomUUID(),
                            ctx.rootId(),
                            "fact",
                            "user",
                            operator.value(),
                            "Operations.purge",
                            "tenant",
                            tenant,
                            "ok",
                            ctx.ip(),
                            ctx.requestId()));
                    return report;
                });
    }
}
