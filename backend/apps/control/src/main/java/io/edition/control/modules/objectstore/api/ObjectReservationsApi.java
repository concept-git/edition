package io.edition.control.modules.objectstore.api;

import java.util.List;
import java.util.function.BooleanSupplier;

public interface ObjectReservationsApi {
    long failedCount();

    int retryFailed();

    void scan(ObjectStoreApi objects);

    InventoryStats inventoryStats();

    record InventoryStats(Long objects, Long bytes, java.time.Instant measuredAt) {}

    boolean failed(java.util.Set<String> keys);

    void retry(java.util.Set<String> keys);

    String inventoryCursor();

    void advanceInventory(String after);

    void protect(String key);

    void observe(String key, java.time.Instant modifiedAt);

    void lock(String key);

    List<String> candidates(int limit);

    boolean collect(String key, BooleanSupplier referenced, Runnable remove);
}
