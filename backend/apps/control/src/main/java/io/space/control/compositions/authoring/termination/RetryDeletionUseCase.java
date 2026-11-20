package io.space.control.compositions.authoring.termination;

import static io.space.control.compositions.authoring.termination.TerminationTypes.*;

import io.space.concepts.deletionrecovery.api.DeletionRecoveryApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RetryDeletionUseCase {
    private final io.space.concepts.objectstore.api.ObjectReservationsApi reservations;
    private final TenantAccess tenants;
    private final IdempotentFlowExecutor idempotency;

    private final DeletionRecoveryApi operations;

    RetryDeletionUseCase(TerminationDependencies dependencies) {
        this.reservations = dependencies.reservations;
        this.tenants = dependencies.tenants;
        this.idempotency = dependencies.idempotency;
        this.operations = dependencies.operations;
    }

    @Transactional
    public void retryDeletion(String credential, UUID tenant, UUID target, String key) {
        var principal = tenants.admitUser(credential, tenant);
        boolean admin = tenants.allows(principal, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        idempotency.execute(
                principal.principal(),
                key,
                "deletion.retry",
                IdempotentFlowExecutor.canonical(tenant, target),
                () -> tenants.inTenant(tenant, () -> {
                    var record = operations.deletion(target).orElseThrow(() -> new SpaceNotFoundException());
                    if (!admin && !principal.principal().id().equals(record.actorId()))
                        throw new PermissionDeniedException();
                    if (!Set.of("failed", "retrying").contains(record.status())) return;
                    reservations.retry(record.objects());
                    operations.retry(target);
                }));
    }
}
