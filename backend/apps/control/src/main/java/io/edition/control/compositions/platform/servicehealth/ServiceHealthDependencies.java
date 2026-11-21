package io.edition.control.compositions.platform.servicehealth;

import io.edition.concepts.servicehealth.api.ServiceHealthApi;
import io.edition.control.compositions.access.PlatformOperatorGuard;
import java.lang.management.ManagementFactory;
import java.time.Clock;
import java.util.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.BuildProperties;

@org.springframework.stereotype.Component
final class ServiceHealthDependencies {
    static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(HeartbeatOnSchedule.class);
    final ServiceHealthApi health;
    final org.springframework.jdbc.core.JdbcTemplate jdbc;
    final PlatformOperatorGuard operators;
    final RemoteHealthProbes remote;
    final Clock clock;
    final String version;
    final String instance;

    ServiceHealthDependencies(
            ServiceHealthApi health,
            org.springframework.jdbc.core.JdbcTemplate jdbc,
            PlatformOperatorGuard operators,
            RemoteHealthProbes remote,
            Clock clock,
            ObjectProvider<BuildProperties> build) {
        this.health = health;
        this.jdbc = jdbc;
        this.operators = operators;
        this.remote = remote;
        this.clock = clock;
        var properties = build.getIfAvailable();
        this.version = properties == null ? "dev" : properties.getVersion();
        this.instance = ManagementFactory.getRuntimeMXBean().getName();
    }
}
