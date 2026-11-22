package io.edition.control.usecases.platform.operations;

import static io.edition.control.usecases.platform.operations.OperationsTypes.*;

import io.edition.control.modules.audit.api.AuditApi;
import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RetryStorageUseCase {

    private final io.edition.control.modules.objectstore.api.ObjectStoreApi objects;

    private final io.edition.control.modules.objectstore.api.ObjectReservationsApi reservations;

    private final AuditApi audit;

    private final PlatformOperatorGuard operators;

    private final IdempotentFlowExecutor idempotency;

    RetryStorageUseCase(OperationsDependencies dependencies) {
        this.objects = dependencies.objects;
        this.reservations = dependencies.reservations;
        this.audit = dependencies.audit;
        this.operators = dependencies.operators;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<StorageRetry> retryStorage(String credential, String key) {
        var actor = operators.require(credential);
        return idempotency.execute(
                new PermissionApi.Principal(PermissionApi.PrincipalType.USER, actor.value()),
                key,
                "storage.retry",
                "failed-source-objects",
                202,
                StorageRetry.class,
                () -> {
                    int count = reservations.retryFailed();
                    var c = RequestAuditContext.current();
                    audit.append(new AuditApi.Event(
                            null,
                            UUID.randomUUID(),
                            c.rootId(),
                            "fact",
                            "user",
                            actor.value(),
                            "Operations.retryStorage",
                            "storage",
                            null,
                            "ok",
                            c.ip(),
                            c.requestId()));
                    return new StorageRetry(count);
                });
    }
}
