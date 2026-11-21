package io.edition.control.compositions.authoring.termination;

import static io.edition.control.compositions.authoring.termination.TerminationTypes.*;

import io.edition.concepts.deletionrecovery.api.DeletionRecoveryApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;

@org.springframework.stereotype.Component
final class TerminationDependencies {
    final io.edition.concepts.objectstore.api.ObjectReservationsApi reservations;
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
            io.edition.concepts.objectstore.api.ObjectReservationsApi reservations) {
        this.reservations = reservations;
        this.tenants = tenants;
        this.idempotency = idempotency;
        this.resources = resources;
        this.operations = operations;
        this.expiredTrashPurge = expiredTrashPurge;
    }
}
