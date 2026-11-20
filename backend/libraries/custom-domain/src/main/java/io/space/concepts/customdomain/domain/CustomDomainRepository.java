package io.space.concepts.customdomain.domain;

import io.space.concepts.customdomain.api.*;
import io.space.concepts.customdomain.api.Host;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomDomainRepository {
    Optional<CustomDomain> find(Host host);

    Optional<CustomDomain> lock(Host host);

    Optional<CustomDomain> insert(CustomDomain domain);

    CustomDomain save(CustomDomain domain);

    void delete(Host host);

    List<CustomDomain> hostsOf(UUID target);

    List<CustomDomain> activeHostsOf(UUID target, Duration ttl);
    /** 多目标按 host 升序分页；afterHost 为空从头开始，返回最多 limit 行。 */
    List<CustomDomain> page(java.util.Set<UUID> targets, String afterHost, int limit, Duration ttl);

    void clearPrimary(UUID target);

    void reclaimExpiredOf(UUID target, Duration ttl);

    boolean reclaimExpired(Host host, Duration ttl);

    Optional<ResolvedHost> lookup(Host host);

    record ResolvedHost(UUID target, UUID tenantId, boolean verified, boolean primary) {}
}
