package io.edition.index.entry.observability;

import io.edition.index.entry.persistence.IndexStore;
import java.lang.management.ManagementFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.BuildProperties;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 心跳：Index 每 30s 通过管理库的 {@code shared.record_service_heartbeat}（SECURITY DEFINER，
 * 索引角色仅有 EXECUTE）报一次「我还活着」，供平台 · 服务状态页判定。写失败只记日志，
 * 不影响投递循环。数据库服务键保持为 {@code edition-worker}。
 */
public @Component class IndexHeartbeat {
    private static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(IndexHeartbeat.class);
    private final JdbcTemplate source;
    private final String version;
    private final String instance;

    public IndexHeartbeat(IndexStore store, ObjectProvider<BuildProperties> build) {
        this.source = store.indexJdbc();
        var properties = build.getIfAvailable();
        this.version = properties == null ? "dev" : properties.getVersion();
        this.instance = ManagementFactory.getRuntimeMXBean().getName();
    }

    @Scheduled(
            initialDelayString = "${index.heartbeat.initial-delay-ms:2000}",
            fixedDelayString = "${index.heartbeat.interval-ms:30000}")
    public void beat() {
        try {
            source.queryForObject(
                    "select shared.record_service_heartbeat(?,?,?,'{}'::jsonb)",
                    Object.class,
                    "edition-worker",
                    instance,
                    version);
        } catch (DataAccessException failure) {
            LOG.warn(
                    "index heartbeat skipped: {}",
                    failure.getMostSpecificCause().getMessage());
        }
    }
}
