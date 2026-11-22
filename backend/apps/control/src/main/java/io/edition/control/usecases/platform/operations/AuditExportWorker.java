package io.edition.control.usecases.platform.operations;

import io.edition.control.modules.audit.api.*;
import io.edition.control.modules.objectstore.api.ObjectStoreApi;
import io.edition.control.modules.tenantregistry.api.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.*;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * 后台审计 CSV 导出；公式注入防护与完成回执 CAS 在本类。
 */
@Component
public class AuditExportWorker {
    private final AuditExportsApi exports;
    private final AuditApi audit;
    private final ObjectStoreApi objects;
    private final TenantScopeApi scope;
    private final TransactionTemplate snapshot;
    private final TransactionTemplate heartbeat;

    public AuditExportWorker(
            AuditExportsApi exports,
            AuditApi audit,
            ObjectStoreApi objects,
            TenantScopeApi scope,
            PlatformTransactionManager manager) {
        this.exports = exports;
        this.audit = audit;
        this.objects = objects;
        this.scope = scope;
        snapshot = new TransactionTemplate(manager);
        snapshot.setReadOnly(true);
        snapshot.setIsolationLevel(TransactionDefinition.ISOLATION_REPEATABLE_READ);
        heartbeat = new TransactionTemplate(manager);
        heartbeat.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public void work() {
        for (var entry : exports.claim()) generate(entry);
    }

    public void generate(AuditExportsApi.Entry entry) {
        Path file = null;
        try {
            file = Files.createTempFile("space-audit-", ".csv");
            try (var writer = Files.newBufferedWriter(file, StandardCharsets.UTF_8)) {
                writer.write(
                        "\ufeffid,time,kind,actor_type,actor_id,action,target_type,target_id,outcome,ip,request_id,root_id\r\n");
                snapshot.executeWithoutResult(tx -> {
                    Runnable write = () -> rows(entry, writer);
                    if (entry.tenantId() == null) write.run();
                    else scope.inTenant(new TenantRegistryApi.TenantId(entry.tenantId()), write);
                });
            }
            if (!Boolean.TRUE.equals(heartbeat.execute(tx -> exports.renew(entry)))) return;
            String key = "audit-exports/" + entry.id() + "/" + entry.token() + ".csv";
            try (var input = Files.newInputStream(file)) {
                objects.putIfAbsent(key, input, Files.size(file), "text/csv; charset=utf-8");
            }
            exports.finish(entry, key, null);
        } catch (IOException
                | UncheckedIOException
                | org.springframework.dao.DataAccessException
                | ObjectStoreApi.Unavailable failure) {
            exports.finish(entry, null, "dependency_unavailable");
        } catch (IllegalStateException failure) {
            exports.finish(entry, null, "unexpected_error");
        } finally {
            if (file != null)
                try {
                    Files.deleteIfExists(file);
                } catch (IOException cleanup) {
                    org.slf4j.LoggerFactory.getLogger(getClass()).warn("Audit temporary file cleanup failed");
                }
        }
    }

    private void rows(AuditExportsApi.Entry entry, BufferedWriter writer) {
        var f = entry.filter();
        Long cursor = null;
        var cutoff = f.to() != null && f.to().isBefore(entry.cutoff()) ? f.to() : entry.cutoff();
        do {
            if (!Boolean.TRUE.equals(heartbeat.execute(tx -> exports.renew(entry))))
                throw new IllegalStateException("export invalidated");
            var rows = audit.query(
                    new AuditApi.Filter(
                            f.actor(), f.action(), f.target(), f.outcome(), f.from(), cutoff, cursor, f.platform()),
                    1000);
            for (var row : rows) {
                try {
                    writer.write(String.join(
                                    ",",
                                    List.of(
                                            csv(row.id()),
                                            csv(row.time()),
                                            csv(row.kind()),
                                            csv(row.actorType()),
                                            csv(row.actorId()),
                                            csv(row.action()),
                                            csv(row.targetType()),
                                            csv(row.targetId()),
                                            csv(row.outcome()),
                                            csv(row.ip()),
                                            csv(row.requestId()),
                                            csv(row.rootId())))
                            + "\r\n");
                } catch (IOException failure) {
                    throw new UncheckedIOException(failure);
                }
                cursor = row.id();
            }
            if (rows.size() < 1000) break;
        } while (cursor != null);
    }

    public static String csv(Object value) {
        String s = value == null ? "" : value.toString();
        String trimmed = s.stripLeading();
        if (!trimmed.isEmpty() && "=+-@".indexOf(trimmed.charAt(0)) >= 0) s = "'" + s;
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
}
