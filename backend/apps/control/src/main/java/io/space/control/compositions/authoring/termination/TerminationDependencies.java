package io.space.control.compositions.authoring.termination;

import static io.space.control.compositions.authoring.termination.TerminationTypes.*;

import io.space.concepts.deletionrecovery.api.DeletionRecoveryApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;

@org.springframework.stereotype.Component
final class TerminationDependencies {
    final io.space.concepts.objectstore.api.ObjectReservationsApi reservations;
    final TenantAccess tenants;
    final IdempotentFlowExecutor idempotency;
    final TerminalResources resources;
    final DeletionRecoveryApi operations;
    final ExpiredTrashPurge expiredTrashPurge;

    public TerminationDependencies(
            TenantAccess tenants,
            IdempotentFlowExecutor idempotency,
            TerminalResources resources,
            DeletionRecoveryApi operations,
            ExpiredTrashPurge expiredTrashPurge,
            io.space.concepts.objectstore.api.ObjectReservationsApi reservations) {
        this.reservations = reservations;
        this.tenants = tenants;
        this.idempotency = idempotency;
        this.resources = resources;
        this.operations = operations;
        this.expiredTrashPurge = expiredTrashPurge;
    }
}
