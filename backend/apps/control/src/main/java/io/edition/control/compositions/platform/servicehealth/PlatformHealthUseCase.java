package io.edition.control.compositions.platform.servicehealth;

import io.edition.concepts.servicehealth.api.ServiceHealthApi;
import io.edition.control.compositions.access.PlatformOperatorGuard;
import java.time.Clock;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PlatformHealthUseCase {

    private final ServiceHealthApi health;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;
    private final PlatformOperatorGuard operators;
    private final RemoteHealthProbes remote;
    private final Clock clock;

    PlatformHealthUseCase(ServiceHealthDependencies dependencies) {
        this.health = dependencies.health;
        this.jdbc = dependencies.jdbc;
        this.operators = dependencies.operators;
        this.remote = dependencies.remote;
        this.clock = dependencies.clock;
    }

    @Transactional(readOnly = true)
    public ServiceStatuses.HealthReport platformHealth(String credential) {
        operators.require(credential);
        var now = clock.instant();
        var byService = new LinkedHashMap<String, List<ServiceStatuses.HealthInstance>>();
        for (var service : ServiceStatuses.SERVICES) byService.put(service, new ArrayList<>());
        for (var beat : health.heartbeats()) {
            var service = "edition-worker".equals(beat.service()) ? "edition-index" : beat.service();
            var instances = byService.get(service);
            if (instances != null) instances.add(ServiceStatuses.instance(beat, now));
        }
        var services = new ArrayList<ServiceStatuses.HealthService>();
        for (var entry : byService.entrySet()) {
            var details = new LinkedHashMap<String, Object>();
            if ("edition-index".equals(entry.getKey())) {
                details.putAll(jdbc.queryForMap("""
                        select backlog as "publicationBacklog", recent_failures as "recentFailures"
                        from publication_v1.search_health()
                        """));
            }
            services.add(new ServiceStatuses.HealthService(
                    entry.getKey(), ServiceStatuses.aggregate(entry.getValue()), entry.getValue(), details));
        }
        services.add(1, remote.reader(now));
        return new ServiceStatuses.HealthReport(now, services);
    }
}
