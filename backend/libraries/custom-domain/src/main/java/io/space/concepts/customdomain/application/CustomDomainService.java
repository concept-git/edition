package io.space.concepts.customdomain.application;

import io.space.concepts.customdomain.api.*;
import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.customdomain.api.CustomDomainEvents;
import io.space.concepts.customdomain.api.Host;
import io.space.concepts.customdomain.domain.CustomDomain;
import io.space.concepts.customdomain.domain.CustomDomainRepository;
import io.space.shared.PageWindow;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class CustomDomainService implements CustomDomainApi {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final CustomDomainRepository repository;
    private final ApplicationEventPublisher events;
    private final Duration unverifiedTtl;

    CustomDomainService(
            CustomDomainRepository repository,
            ApplicationEventPublisher events,
            @Value("${io.space.dns.unverified-ttl:PT72H}") Duration unverifiedTtl) {
        this.repository = repository;
        this.events = events;
        this.unverifiedTtl = unverifiedTtl;
    }

    @Override
    public BindResult bind(String host, UUID target) {
        final Host parsed;
        try {
            parsed = new Host(host);
        } catch (Host.Invalid ignored) {
            return new BindResult.HostInvalid();
        }
        repository.reclaimExpired(parsed, unverifiedTtl);
        var occupancy = repository.lookup(parsed);
        if (occupancy.isPresent()) {
            var current = occupancy.orElseThrow();
            if (!current.target().equals(target)) return new BindResult.Taken();
            return repository
                    .find(parsed)
                    .map(domain -> (BindResult) new BindResult.Bound(domain.view()))
                    .orElseGet(BindResult.Taken::new);
        }
        var created = new CustomDomain(parsed, target, false, false, token(), Instant.now());
        var inserted = repository.insert(created);
        if (inserted.isEmpty()) return new BindResult.Taken();
        var view = inserted.orElseThrow().view();
        events.publishEvent(new CustomDomainEvents.Bound(view));
        return new BindResult.Bound(view);
    }

    @Override
    public VerifyResult verify(String host, String dnsToken) {
        final Host parsed;
        try {
            parsed = new Host(host);
        } catch (Host.Invalid ignored) {
            return new VerifyResult.HostInvalid();
        }
        repository.reclaimExpired(parsed, unverifiedTtl);
        var current = repository.lock(parsed);
        if (current.isEmpty()) return new VerifyResult.NotFound();
        try {
            boolean changed = current.orElseThrow().verify(dnsToken);
            var saved = changed ? repository.save(current.orElseThrow()) : current.orElseThrow();
            if (changed) events.publishEvent(new CustomDomainEvents.Verified(saved.view()));
            return new VerifyResult.Verified(saved.view());
        } catch (CustomDomain.NotProven ignored) {
            return new VerifyResult.NotProven();
        }
    }

    @Override
    public SetPrimaryResult setPrimary(String host) {
        final Host parsed;
        try {
            parsed = new Host(host);
        } catch (Host.Invalid ignored) {
            return new SetPrimaryResult.HostInvalid();
        }
        repository.reclaimExpired(parsed, unverifiedTtl);
        var current = repository.lock(parsed);
        if (current.isEmpty()) return new SetPrimaryResult.NotFound();
        try {
            boolean changed = current.orElseThrow().setPrimary();
            if (changed) repository.clearPrimary(current.orElseThrow().target());
            var saved = changed ? repository.save(current.orElseThrow()) : current.orElseThrow();
            if (changed) events.publishEvent(new CustomDomainEvents.PrimarySet(saved.view()));
            return new SetPrimaryResult.Changed(saved.view());
        } catch (CustomDomain.NotVerified ignored) {
            return new SetPrimaryResult.NotVerified();
        }
    }

    @Override
    public UnbindResult unbind(String host) {
        final Host parsed;
        try {
            parsed = new Host(host);
        } catch (Host.Invalid ignored) {
            return new UnbindResult.HostInvalid();
        }
        repository.reclaimExpired(parsed, unverifiedTtl);
        var current = repository.find(parsed);
        if (current.isEmpty()) return new UnbindResult.Unbound();
        repository.delete(parsed);
        events.publishEvent(new CustomDomainEvents.Unbound(
                parsed.value(), current.orElseThrow().view().target()));
        return new UnbindResult.Unbound();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Resolved> resolve(String host) {
        final Host parsed;
        try {
            parsed = new Host(host);
        } catch (Host.Invalid ignored) {
            return Optional.empty();
        }
        return repository
                .lookup(parsed)
                .filter(CustomDomainRepository.ResolvedHost::verified)
                .map(row -> new Resolved(row.target(), row.tenantId(), row.primary()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> hostsOf(UUID target) {
        return repository.hostsOf(target).stream().map(CustomDomain::view).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> activeHostsOf(UUID target) {
        return repository.activeHostsOf(target, unverifiedTtl).stream()
                .map(CustomDomain::view)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page page(java.util.Set<UUID> targets, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        String after = decodeCursor(cursor);
        if (targets.isEmpty()) return new Page(List.of(), null);
        List<CustomDomain> rows = repository.page(targets, after, limit + 1, unverifiedTtl);
        var window = PageWindow.of(rows, limit, row -> encodeCursor(row.host().value()));
        return new Page(window.items().stream().map(CustomDomain::view).toList(), window.nextCursor());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<String> primaryOf(UUID target) {
        return hostsOf(target).stream().filter(View::isPrimary).map(View::host).findFirst();
    }

    private static String token() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    /** host 全局唯一，游标即上一页最后一个 host 的 URL-safe Base64；空白表示从头开始。 */
    private static String encodeCursor(String host) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(host.getBytes(StandardCharsets.UTF_8));
    }

    private static String decodeCursor(String cursor) {
        if (cursor == null || cursor.isBlank()) return null;
        try {
            return new Host(new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8)).value();
        } catch (IllegalArgumentException | Host.Invalid invalid) {
            throw new IllegalArgumentException("invalid domain cursor", invalid);
        }
    }
}
