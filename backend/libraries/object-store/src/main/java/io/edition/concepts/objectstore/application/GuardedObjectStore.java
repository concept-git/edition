package io.edition.concepts.objectstore.application;

import io.edition.concepts.objectstore.api.*;
import java.io.InputStream;
import java.time.Duration;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Protects source objects before bytes or presigned uploads exist; holds a transaction lock through
 * reference commit.
 */
@Component
@Primary
public class GuardedObjectStore implements ObjectStoreApi {
    private final ObjectStoreApi delegate;
    private final ObjectReservationsApi reservations;

    public GuardedObjectStore(
            @Qualifier("minioObjectStore") ObjectStoreApi delegate, ObjectReservationsApi reservations) {
        this.delegate = delegate;
        this.reservations = reservations;
    }

    @Transactional
    public void putIfAbsent(String key, byte[] bytes, String mime) {
        protectAndLockForWrite(key);
        delegate.putIfAbsent(key, bytes, mime);
    }

    @Transactional
    public void putIfAbsent(String key, InputStream stream, long size, String mime) {
        protectAndLockForWrite(key);
        delegate.putIfAbsent(key, stream, size, mime);
    }

    public boolean exists(String key) {
        return delegate.exists(key);
    }

    public Optional<InputStream> open(String key) {
        return delegate.open(key);
    }

    public PresignedGet presignGet(String key, Duration ttl, String name, String mime) {
        return delegate.presignGet(key, ttl, name, mime);
    }

    @Transactional
    public PresignedPut presignPut(String key, Duration ttl, String mime) {
        protectAndLockForWrite(key);
        return delegate.presignPut(key, ttl, mime);
    }

    public void remove(String key) {
        delegate.remove(key);
    }

    private void protectAndLockForWrite(String key) {
        @SuppressWarnings("unchecked")
        var lockedKeys = (java.util.Set<String>)
                org.springframework.transaction.support.TransactionSynchronizationManager.getResource(this);
        if (lockedKeys == null) {
            lockedKeys = new java.util.HashSet<>();
            org.springframework.transaction.support.TransactionSynchronizationManager.bindResource(this, lockedKeys);
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                    new org.springframework.transaction.support.TransactionSynchronization() {
                        @Override
                        public void afterCompletion(int status) {
                            org.springframework.transaction.support.TransactionSynchronizationManager
                                    .unbindResourceIfPossible(GuardedObjectStore.this);
                        }
                    });
        }
        if (lockedKeys.add(key)) {
            reservations.protect(key);
            reservations.lock(key);
        }
    }

    public java.util.List<StoredObject> inventory(String after, int limit) {
        return delegate.inventory(after, limit);
    }
}
