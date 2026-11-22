package io.edition.index.adapters.inbound;

import io.edition.index.usecases.SearchQueue;
import java.lang.management.ManagementFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.BuildProperties;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 心跳：Index 每 30s 通过管理库的 {@code shared.record_service_heartbeat}（SECURITY DEFINER，
 * 索引角色仅有 EXECUTE）报一次「我还活着」，供平台 · 服务状态页判定。写失败只记日志，
 * 不影响投递循环。数据库服务键保持为 {@code edition-worker}。
 */
public @Component class IndexHeartbeat {
    private static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(IndexHeartbeat.class);
    private final SearchQueue queue;
    private final String version;
    private final String instance;

    public IndexHeartbeat(SearchQueue queue, ObjectProvider<BuildProperties> build) {
        this.queue = queue;
        var properties = build.getIfAvailable();
        this.version = properties == null ? "dev" : properties.getVersion();
        this.instance = ManagementFactory.getRuntimeMXBean().getName();
    }

    @Scheduled(
            initialDelayString = "${index.heartbeat.initial-delay-ms:2000}",
            fixedDelayString = "${index.heartbeat.interval-ms:30000}")
    public void beat() {
        try {
            queue.recordHeartbeat("edition-worker", instance, version);
        } catch (DataAccessException failure) {
            LOG.warn(
                    "index heartbeat skipped: {}",
                    failure.getMostSpecificCause().getMessage());
        }
    }
}
