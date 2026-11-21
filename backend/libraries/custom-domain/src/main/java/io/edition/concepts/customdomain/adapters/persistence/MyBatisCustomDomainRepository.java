package io.edition.concepts.customdomain.adapters.persistence;

import io.edition.concepts.customdomain.api.*;
import io.edition.concepts.customdomain.api.Host;
import io.edition.concepts.customdomain.domain.CustomDomain;
import io.edition.concepts.customdomain.domain.CustomDomainRepository;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
class MyBatisCustomDomainRepository implements CustomDomainRepository {
    private final CustomDomainMapper mapper;

    MyBatisCustomDomainRepository(CustomDomainMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public Optional<CustomDomain> find(Host host) {
        return Optional.ofNullable(mapper.find(host.value())).map(MyBatisCustomDomainRepository::domain);
    }

    @Override
    public Optional<CustomDomain> lock(Host host) {
        return Optional.ofNullable(mapper.lock(host.value())).map(MyBatisCustomDomainRepository::domain);
    }

    @Override
    public Optional<CustomDomain> insert(CustomDomain domain) {
        // host 的竞争已由 INSERT ON CONFLICT 裁决；其它约束异常不能冒充 HostTaken。
        return Optional.ofNullable(
                        mapper.insert(domain.host().value(), domain.target(), domain.dnsToken(), domain.createdAt()))
                .map(MyBatisCustomDomainRepository::domain);
    }

    @Override
    public CustomDomain save(CustomDomain domain) {
        return domain(mapper.save(domain.host().value(), domain.verified(), domain.primary()));
    }

    @Override
    public void delete(Host host) {
        mapper.delete(host.value());
    }

    @Override
    public List<CustomDomain> hostsOf(UUID target) {
        return mapper.hostsOf(target, null).stream()
                .map(MyBatisCustomDomainRepository::domain)
                .toList();
    }

    @Override
    public List<CustomDomain> activeHostsOf(UUID target, Duration ttl) {
        return mapper.hostsOf(target, ttl.toSeconds()).stream()
                .map(MyBatisCustomDomainRepository::domain)
                .toList();
    }

    @Override
    public List<CustomDomain> page(java.util.Set<UUID> targets, String afterHost, int limit, Duration ttl) {
        if (targets.isEmpty()) return List.of();
        return mapper
                .page(targets.stream().sorted().map(UUID::toString).toList(), afterHost, limit, ttl.toSeconds())
                .stream()
                .map(MyBatisCustomDomainRepository::domain)
                .toList();
    }

    @Override
    public void clearPrimary(UUID target) {
        mapper.clearPrimary(target);
    }

    @Override
    public void reclaimExpiredOf(UUID target, Duration ttl) {
        mapper.reclaimExpiredOf(target, Math.max(ttl.toSeconds(), 0));
    }

    @Override
    public boolean reclaimExpired(Host host, Duration ttl) {
        return Boolean.TRUE.equals(mapper.reclaimExpired(host.value(), Math.max(ttl.toSeconds(), 0)));
    }

    @Override
    public Optional<ResolvedHost> lookup(Host host) {
        CustomDomainMapper.OccupancyRow row = mapper.lookup(host.value());
        if (row == null) return Optional.empty();
        return Optional.of(new ResolvedHost(
                UUID.fromString(row.siteId()), UUID.fromString(row.tenantId()),
                row.verified(), row.isPrimary()));
    }

    private static CustomDomain domain(CustomDomainMapper.DomainRow row) {
        return new CustomDomain(
                new Host(row.host()),
                UUID.fromString(row.siteId()),
                row.verified(),
                row.isPrimary(),
                row.dnsToken(),
                row.createdAt());
    }
}
