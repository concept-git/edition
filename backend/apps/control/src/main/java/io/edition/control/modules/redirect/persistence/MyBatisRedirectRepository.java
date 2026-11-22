package io.edition.control.modules.redirect.persistence;

import io.edition.control.modules.redirect.api.*;
import io.edition.control.modules.redirect.api.RedirectApi;
import io.edition.control.modules.redirect.api.RedirectPath;
import io.edition.control.modules.redirect.domain.Redirect;
import io.edition.control.modules.redirect.domain.RedirectRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
class MyBatisRedirectRepository implements RedirectRepository {
    private final RedirectMapper mapper;

    MyBatisRedirectRepository(RedirectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public Optional<Redirect> insert(Redirect redirect) {
        return Optional.ofNullable(mapper.insert(
                        redirect.scopeId(),
                        redirect.path().value(),
                        redirect.targetType().stored(),
                        redirect.targetId(),
                        redirect.origin().stored(),
                        redirect.createdAt()))
                .map(MyBatisRedirectRepository::redirect);
    }

    @Override
    public Redirect save(Redirect redirect) {
        return redirect(mapper.save(
                redirect.scopeId(),
                redirect.path().value(),
                redirect.targetType().stored(),
                redirect.targetId(),
                redirect.origin().stored(),
                redirect.createdAt()));
    }

    @Override
    public void delete(UUID scope, RedirectPath path) {
        mapper.delete(scope, path.value());
    }

    @Override
    public Optional<Redirect> find(UUID scope, RedirectPath path) {
        return Optional.ofNullable(mapper.find(scope, path.value())).map(MyBatisRedirectRepository::redirect);
    }

    @Override
    public Optional<Redirect> lock(UUID scope, RedirectPath path) {
        return Optional.ofNullable(mapper.lock(scope, path.value())).map(MyBatisRedirectRepository::redirect);
    }

    @Override
    public Optional<Redirect> lookup(UUID scope, String requestPath) {
        return Optional.ofNullable(mapper.lookup(scope, requestPath)).map(MyBatisRedirectRepository::redirect);
    }

    @Override
    public List<Redirect> page(
            UUID scope, RedirectApi.Origin origin, Instant beforeCreatedAt, String beforePath, int limit) {
        return mapper.page(scope, origin == null ? null : origin.stored(), beforeCreatedAt, beforePath, limit).stream()
                .map(MyBatisRedirectRepository::redirect)
                .toList();
    }

    private static Redirect redirect(RedirectMapper.RuleRow row) {
        return new Redirect(
                UUID.fromString(row.siteId()),
                new RedirectPath(row.path()),
                RedirectApi.TargetType.parse(row.targetType()),
                UUID.fromString(row.targetId()),
                RedirectApi.Origin.parse(row.origin()),
                row.createdAt());
    }
}
