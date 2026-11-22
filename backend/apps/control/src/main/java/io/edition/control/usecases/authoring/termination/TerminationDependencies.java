package io.edition.control.usecases.authoring.termination;

import static io.edition.control.usecases.authoring.termination.TerminationTypes.*;

import io.edition.control.modules.deletionrecovery.api.DeletionRecoveryApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;

@org.springframework.stereotype.Component
final class TerminationDependencies {
    final io.edition.control.modules.objectstore.api.ObjectReservationsApi reservations;
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
            io.edition.control.modules.objectstore.api.ObjectReservationsApi reservations) {
        this.reservations = reservations;
        this.tenants = tenants;
        this.idempotency = idempotency;
        this.resources = resources;
        this.operations = operations;
        this.expiredTrashPurge = expiredTrashPurge;
    }
}
