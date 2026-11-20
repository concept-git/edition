package io.space.control.compositions.platform.servicehealth;

import io.space.concepts.servicehealth.api.ServiceHealthApi;
import java.util.*;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class HeartbeatOnSchedule {
    private static final org.slf4j.Logger LOG = ServiceHealthDependencies.LOG;
    private final ServiceHealthApi health;

    private final String version;
    private final String instance;

    HeartbeatOnSchedule(ServiceHealthDependencies dependencies) {
        this.health = dependencies.health;
        this.version = dependencies.version;
        this.instance = dependencies.instance;
    }

    @Scheduled(
            initialDelayString = "${io.space.health.initial-delay-ms:5000}",
            fixedDelayString = "${io.space.health.heartbeat-ms:30000}")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void heartbeat() {
        try {
            health.beat("space-management", instance, version, Map.of());
        } catch (DataAccessException failure) {
            // 心跳失败不能拖垮任何业务事务；它本身就是「管理库不可达」的一次观察。
            LOG.warn(
                    "service heartbeat skipped: {}",
                    failure.getMostSpecificCause().getMessage());
        }
    }
}
