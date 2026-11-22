package io.edition.control.usecases.platform.servicehealth;

import io.edition.control.modules.servicehealth.api.ServiceHealthApi;
import java.util.*;
import org.springframework.dao.DataAccessException;
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

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void heartbeat() {
        try {
            health.beat("edition-management", instance, version, Map.of());
        } catch (DataAccessException failure) {
            // 心跳失败不能拖垮任何业务事务；它本身就是「管理库不可达」的一次观察。
            LOG.warn(
                    "service heartbeat skipped: {}",
                    failure.getMostSpecificCause().getMessage());
        }
    }
}
