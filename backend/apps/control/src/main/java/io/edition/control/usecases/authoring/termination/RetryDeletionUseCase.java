package io.edition.control.usecases.authoring.termination;

import static io.edition.control.usecases.authoring.termination.TerminationTypes.*;

import io.edition.control.modules.deletionrecovery.api.DeletionRecoveryApi;
import io.edition.control.usecases.access.PermissionDeniedException;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.SpaceNotFoundException;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RetryDeletionUseCase {
    private final io.edition.control.modules.objectstore.api.ObjectReservationsApi reservations;
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
