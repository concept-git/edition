package io.edition.control.compositions.releases.bundleexport;

import io.edition.concepts.bundleexport.api.*;
import io.edition.concepts.objectstore.api.*;
import io.edition.concepts.tenantregistry.api.*;
import io.edition.shared.Sha256;
import java.io.*;
import java.nio.file.*;
import java.security.*;
import java.util.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
final class BundleExportWorker {
    private final BundleExportJobs jobs;
    private final BundleZipWriter writer;
    private final ObjectStoreApi objects;
    private final ObjectReservationsApi reservations;
    private final TenantScopeApi scope;

    BundleExportWorker(
            BundleExportJobs jobs,
            BundleZipWriter writer,
            ObjectStoreApi objects,
            ObjectReservationsApi reservations,
            TenantScopeApi scope) {
        this.jobs = jobs;
        this.writer = writer;
        this.objects = objects;
        this.reservations = reservations;
        this.scope = scope;
    }

    @Scheduled(
            initialDelayString = "${io.edition.bundle-export.initial-delay:1000}",
            fixedDelayString = "${io.edition.bundle-export.poll-delay:500}")
    public void poll() {
        for (var pending : jobs.pending(20)) {
            try {
                var lease = scope.inTenant(
                        new TenantRegistryApi.TenantId(pending.tenant()), () -> jobs.claim(pending.id()));
                lease.ifPresent(this::exportBundle);
            } catch (org.springframework.dao.DataAccessException unavailable) {
                org.slf4j.LoggerFactory.getLogger(getClass())
                        .warn("bundle export queue unavailable job={}", pending.id());
            }
        }
    }

    private void exportBundle(BundleExportJobs.Lease lease) {
        Path temporary = null;
        try {
            temporary = Files.createTempFile("space-bundle-", ".zip");
            long[] heartbeat = {0};
            Runnable renewLease = () -> {
                long now = System.nanoTime();
                if (now - heartbeat[0] < 1_000_000_000L) return;
                boolean leaseRenewed =
                        scope.inTenant(new TenantRegistryApi.TenantId(lease.tenant()), () -> jobs.heartbeat(lease));
                if (!leaseRenewed) throw new LeaseLost();
                heartbeat[0] = now;
            };
            MessageDigest digest = Sha256.newDigest();
            try (var output = new DigestOutputStream(Files.newOutputStream(temporary), digest)) {
                writer.write(
                        lease.snapshot(),
                        output,
                        key -> objects.open(key)
                                .orElseThrow(() -> new BundleZipWriter.Invalid("export_source_missing")),
                        renewLease);
            }
            renewLease.run();
            String hash = HexFormat.of().formatHex(digest.digest());
            long bytes = Files.size(temporary);
            reservations.protect(hash);
            try (var input = new FilterInputStream(Files.newInputStream(temporary)) {
                @Override
                public int read(byte[] buffer, int start, int count) throws IOException {
                    int read = super.read(buffer, start, count);
                    renewLease.run();
                    return read;
                }
            }) {
                objects.putIfAbsent(hash, input, bytes, "application/zip");
            }
            scope.inTenant(new TenantRegistryApi.TenantId(lease.tenant()), () -> jobs.complete(lease, hash, bytes));
        } catch (LeaseLost abandoned) {
            // A newer lease or expiry owns the outcome; the old worker cannot acknowledge it.
        } catch (BundleZipWriter.Invalid invalid) {
            org.slf4j.LoggerFactory.getLogger(getClass())
                    .warn("bundle export rejected job={} code={}", lease.id(), invalid.getMessage());
            scope.inTenant(
                    new TenantRegistryApi.TenantId(lease.tenant()),
                    () -> jobs.fail(lease, invalid.getMessage(), false));
        } catch (ObjectStoreApi.Unavailable | IOException unavailable) {
            scope.inTenant(
                    new TenantRegistryApi.TenantId(lease.tenant()),
                    () -> jobs.fail(lease, "dependency_unavailable", true));
        } finally {
            if (temporary != null)
                try {
                    Files.deleteIfExists(temporary);
                } catch (IOException unavailable) {
                    org.slf4j.LoggerFactory.getLogger(getClass())
                            .warn("bundle export temporary cleanup failed job={}", lease.id());
                }
        }
    }

    private static final class LeaseLost extends RuntimeException {}
}
