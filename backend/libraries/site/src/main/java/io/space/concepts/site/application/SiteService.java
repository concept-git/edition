package io.space.concepts.site.application;

import io.space.concepts.site.api.*;
import io.space.concepts.site.api.SiteApi;
import io.space.concepts.site.api.SiteEvents;
import io.space.concepts.site.domain.Site;
import io.space.concepts.site.domain.SiteName;
import io.space.concepts.site.domain.SiteRepository;
import io.space.concepts.site.domain.Slug;
import io.space.shared.KeysetCursor;
import io.space.shared.PageWindow;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class SiteService implements SiteApi {
    private final SiteRepository repository;
    private final ApplicationEventPublisher events;

    SiteService(SiteRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    @Override
    public View create(ActorId actor, UUID tenantId, String name) {
        try {
            var created = repository.insert(tenantId, new SiteName(name), actor).view();
            events.publishEvent(new SiteEvents.Created(actor, created));
            return created;
        } catch (SiteName.Invalid invalid) {
            throw new IllegalArgumentException("site name invalid", invalid);
        }
    }

    @Override
    public MutationResult rename(ActorId actor, SiteId site, String name) {
        try {
            return mutate(actor, site, current -> current.rename(new SiteName(name), actor), true);
        } catch (SiteName.Invalid invalid) {
            throw new IllegalArgumentException("site name invalid", invalid);
        }
    }

    @Override
    public MutationResult setRule(ActorId actor, SiteId site, String rule) {
        return mutate(actor, site, current -> current.setRule(rule, actor), true);
    }

    @Override
    public MutationResult setHome(ActorId actor, SiteId site, Optional<UUID> target) {
        return mutate(actor, site, current -> current.setHome(target, actor), true);
    }

    @Override
    public MutationResult setBranding(ActorId actor, SiteId site, Branding branding) {
        return mutate(actor, site, current -> current.setBranding(branding, actor), true);
    }

    @Override
    public MutationResult setTitleTemplate(ActorId actor, SiteId site, Optional<String> template) {
        return mutate(actor, site, current -> current.setTitleTemplate(template, actor), true);
    }

    @Override
    public MutationResult setLocale(ActorId actor, SiteId site, Optional<String> locale) {
        return mutate(actor, site, current -> current.setLocale(locale, actor), true);
    }

    @Override
    public MutationResult setAnalytics(ActorId actor, SiteId site, Optional<String> analyticsId) {
        return mutate(actor, site, current -> current.setAnalytics(analyticsId, actor), true);
    }

    @Override
    public MutationResult setRobots(ActorId actor, SiteId site, RobotsPolicy policy) {
        return mutate(actor, site, current -> current.setRobots(policy, actor), true);
    }

    @Override
    public MountResult mount(ActorId actor, SiteId site, UUID target, String slug) {
        final Slug normalized;
        try {
            normalized = new Slug(slug);
        } catch (Slug.Invalid invalid) {
            return new MountResult.SlugInvalid();
        }
        var current = repository.lock(site);
        if (current.isEmpty()) return new MountResult.NotFound();
        var outcome = current.orElseThrow().mount(normalized, target, actor);
        return switch (outcome) {
            case SLUG_TAKEN -> occupant(current.orElseThrow(), normalized.value());
            case TARGET_TAKEN -> new MountResult.TargetAlreadyMounted();
            case MISSING -> new MountResult.MountMissing();
            case OK -> {
                var view = repository.save(current.orElseThrow()).view();
                events.publishEvent(new SiteEvents.Mounted(actor, view));
                yield new MountResult.Mounted(view);
            }
        };
    }

    @Override
    public MountResult remount(ActorId actor, SiteId site, String slug, String newSlug) {
        final Slug from;
        final Slug to;
        try {
            from = new Slug(slug);
            to = new Slug(newSlug);
        } catch (Slug.Invalid invalid) {
            return new MountResult.SlugInvalid();
        }
        var current = repository.lock(site);
        if (current.isEmpty()) return new MountResult.NotFound();
        var outcome = current.orElseThrow().remount(from, to, actor);
        return switch (outcome) {
            case SLUG_TAKEN -> occupant(current.orElseThrow(), to.value());
            case TARGET_TAKEN -> new MountResult.TargetAlreadyMounted();
            case MISSING -> new MountResult.MountMissing();
            case OK -> {
                boolean changed = !from.value().equals(to.value());
                var view = changed
                        ? repository.save(current.orElseThrow()).view()
                        : current.orElseThrow().view();
                if (changed) events.publishEvent(new SiteEvents.Remounted(actor, view));
                yield new MountResult.Mounted(view);
            }
        };
    }

    @Override
    public MutationResult unmount(ActorId actor, SiteId site, String slug) {
        final String normalized;
        try {
            normalized = new Slug(slug).value();
        } catch (Slug.Invalid invalid) {
            return repository
                    .find(site)
                    .<MutationResult>map(value -> new MutationResult.Changed(value.view()))
                    .orElseGet(MutationResult.NotFound::new);
        }
        var current = repository.lock(site);
        if (current.isEmpty()) return new MutationResult.NotFound();
        boolean changed = current.orElseThrow().unmount(normalized, actor);
        var view = changed
                ? repository.save(current.orElseThrow()).view()
                : current.orElseThrow().view();
        if (changed) events.publishEvent(new SiteEvents.Unmounted(actor, view));
        return new MutationResult.Changed(view);
    }

    @Override
    public MutationResult reorder(ActorId actor, SiteId site, List<String> order) {
        try {
            List<String> normalized =
                    order.stream().map(value -> new Slug(value).value()).toList();
            return mutate(actor, site, current -> current.reorder(normalized, actor), false);
        } catch (Slug.Invalid | Site.OrderInvalid invalid) {
            return new MutationResult.OrderInvalid();
        }
    }

    @Override
    public DeleteResult delete(ActorId actor, SiteId site) {
        var current = repository.lock(site);
        if (current.isEmpty()) return new DeleteResult.NotFound();
        try {
            current.orElseThrow().requireEmpty();
        } catch (Site.NotEmpty empty) {
            return new DeleteResult.NotEmpty();
        }
        repository.delete(site);
        events.publishEvent(
                new SiteEvents.Deleted(actor, site, current.orElseThrow().view().tenantId()));
        return new DeleteResult.Deleted();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<View> view(SiteId site) {
        return repository.find(site).map(Site::view);
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> listByTenant(UUID tenantId) {
        return repository.findByTenant(tenantId).stream().map(Site::view).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page pageByTenant(UUID tenantId, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Optional<KeysetCursor> decoded = KeysetCursor.decode(cursor);
        var rows = repository.pageByTenant(
                tenantId,
                decoded.map(KeysetCursor::at).orElse(null),
                decoded.map(KeysetCursor::id).orElse(null),
                limit + 1);
        var window =
                PageWindow.of(rows, limit, row -> KeysetCursor.encode(row.view().updatedAt(), row.id()));
        return new Page(window.items().stream().map(Site::view).toList(), window.nextCursor());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> tenantOf(SiteId site) {
        return repository.find(site).map(Site::tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> targetAt(SiteId site, String slug) {
        try {
            String normalized = new Slug(slug).value();
            return repository
                    .find(site)
                    .flatMap(value -> value.mounts().stream()
                            .filter(mount -> mount.slug().equals(normalized))
                            .map(Mount::target)
                            .findFirst());
        } catch (Slug.Invalid invalid) {
            return Optional.empty();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Mount> mounts(SiteId site) {
        return repository.find(site).map(Site::mounts).orElse(List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Occurrence> mountsOf(UUID target) {
        return repository.mountsOf(target);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<String> slugOf(SiteId site, UUID target) {
        return repository
                .find(site)
                .flatMap(value -> value.mounts().stream()
                        .filter(mount -> mount.target().equals(target))
                        .map(Mount::slug)
                        .findFirst());
    }

    private MutationResult mutate(
            ActorId actor, SiteId site, java.util.function.Function<Site, Boolean> action, boolean settings) {
        var current = repository.lock(site);
        if (current.isEmpty()) return new MutationResult.NotFound();
        try {
            boolean changed = action.apply(current.orElseThrow());
            var view = changed
                    ? repository.save(current.orElseThrow()).view()
                    : current.orElseThrow().view();
            if (changed) {
                events.publishEvent(
                        settings ? new SiteEvents.SettingsChanged(actor, view) : new SiteEvents.Reordered(actor, view));
            }
            return new MutationResult.Changed(view);
        } catch (Site.HomeNotMounted ignored) {
            return new MutationResult.HomeNotMounted();
        } catch (Site.InvalidRule ignored) {
            return new MutationResult.InvalidRule();
        } catch (Site.InvalidTitleTemplate ignored) {
            return new MutationResult.InvalidTitleTemplate();
        } catch (Site.OrderInvalid ignored) {
            return new MutationResult.OrderInvalid();
        }
    }

    private static MountResult occupant(Site site, String slug) {
        return new MountResult.SlugTaken(site.mounts().stream()
                .filter(mount -> mount.slug().equals(slug))
                .map(Mount::target)
                .findFirst()
                .orElseThrow());
    }

    @Override
    public Optional<View> lock(SiteId site) {
        return repository.lock(site).map(io.space.concepts.site.domain.Site::view);
    }
}
