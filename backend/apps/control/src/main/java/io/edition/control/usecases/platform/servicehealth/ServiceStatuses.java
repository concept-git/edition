package io.edition.control.usecases.platform.servicehealth;

import io.edition.control.modules.servicehealth.api.ServiceHealthApi;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

/** 心跳 → 服务判定的纯规则；无状态，便于单测。 */
public final class ServiceStatuses {
    static final Duration NORMAL_WITHIN = Duration.ofSeconds(60);
    static final Duration LAGGING_WITHIN = Duration.ofSeconds(180);
    static final List<String> SERVICES = List.of("edition-management", "edition-index");

    private ServiceStatuses() {}

    static String classify(Instant seenAt, Instant now) {
        if (seenAt == null) return "unknown";
        var age = Duration.between(seenAt, now);
        if (age.compareTo(NORMAL_WITHIN) <= 0) return "normal";
        if (age.compareTo(LAGGING_WITHIN) <= 0) return "lagging";
        return "lost";
    }

    /** 同一服务多实例：任一实例正常即正常；否则取最好的那个实例状态。 */
    static String aggregate(List<HealthInstance> instances) {
        if (instances.isEmpty()) return "unknown";
        var rank = List.of("normal", "lagging", "lost", "unknown");
        return instances.stream()
                .map(HealthInstance::status)
                .min(Comparator.comparingInt(rank::indexOf))
                .orElse("unknown");
    }

    static HealthInstance instance(ServiceHealthApi.Heartbeat beat, Instant now) {
        return new HealthInstance(
                beat.instance(), beat.version(), beat.seenAt(), classify(beat.seenAt(), now), beat.details());
    }

    public record HealthInstance(
            String instance, String version, Instant seenAt, String status, Map<String, Object> details) {}

    public record HealthService(
            String service, String status, List<HealthInstance> instances, Map<String, Object> details) {}

    public record HealthReport(Instant checkedAt, List<HealthService> services) {}
}
