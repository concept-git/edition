package io.edition.control.usecases.platform.operations;

import static io.edition.control.usecases.platform.operations.OperationsTypes.*;

import io.edition.control.usecases.*;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class StorageUsageUseCase {

    private final io.edition.control.modules.objectstore.api.ObjectStoreApi objects;

    private final io.edition.control.modules.objectstore.api.ObjectReservationsApi reservations;
    private final io.edition.control.modules.servicehealth.api.ServiceHealthApi health;

    private final PlatformOperatorGuard operators;

    StorageUsageUseCase(OperationsDependencies dependencies) {
        this.objects = dependencies.objects;
        this.reservations = dependencies.reservations;
        this.health = dependencies.health;
        this.operators = dependencies.operators;
    }

    @Transactional(readOnly = true)
    public StorageUsage storageUsage(String credential) {
        operators.require(credential);
        var inventory = reservations.inventoryStats();
        return new StorageUsage(
                inventory.objects(),
                inventory.bytes(),
                inventory.measuredAt(),
                health.databaseBytes(),
                reservations.failedCount());
    }
}
