package io.space.control.compositions.platform.operations;

import static io.space.control.compositions.platform.operations.OperationsTypes.*;

import io.space.concepts.audit.api.AuditApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.control.compositions.*;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RetryStorageUseCase {

    private final io.space.concepts.objectstore.api.ObjectStoreApi objects;

    private final io.space.concepts.objectstore.api.ObjectReservationsApi reservations;

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
