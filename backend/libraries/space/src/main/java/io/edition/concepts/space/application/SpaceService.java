package io.edition.concepts.space.application;

import io.edition.concepts.space.api.*;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.space.api.SpaceEvents;
import io.edition.concepts.space.domain.Space;
import io.edition.concepts.space.domain.SpaceName;
import io.edition.concepts.space.domain.SpaceRepository;
import io.edition.content.ResourcePath;
import io.edition.shared.KeysetCursor;
import io.edition.shared.PageWindow;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class SpaceService implements SpaceApi {
    private final SpaceRepository repository;
    private final ApplicationEventPublisher events;

    SpaceService(SpaceRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    @Override
    public View create(ActorId actor, UUID tenantId, String name, Mode mode) {
        var created =
                repository.insert(tenantId, new SpaceName(name), mode, actor).view();
        events.publishEvent(new SpaceEvents.Created(actor, created));
        return created;
    }

    @Override
    public MutationResult rename(ActorId actor, SpaceId space, String name) {
        return mutate(
                space,
                current -> current.rename(new SpaceName(name), actor),
                view -> new SpaceEvents.Renamed(actor, view));
    }

    @Override
    public MutationResult describe(ActorId actor, SpaceId space, Patch<IconKey> icon, Patch<String> description) {
        return mutate(
                space,
                current -> current.describe(icon, description, actor),
                view -> new SpaceEvents.Described(actor, view));
    }

    @Override
    public MutationResult convert(ActorId actor, SpaceId space, Mode toMode) {
        return mutate(space, current -> current.convert(toMode, actor), view -> new SpaceEvents.Converted(actor, view));
    }

    @Override
    public MutationResult setAutoRelease(ActorId actor, SpaceId space, boolean on) {
        return mutate(
                space,
                current -> current.setAutoRelease(on, actor),
                view -> new SpaceEvents.AutoReleaseSet(actor, view));
    }

    private MutationResult mutate(
            SpaceId id,
            java.util.function.Predicate<Space> change,
            java.util.function.Function<View, Object> completedEvent) {
        var current = repository.lock(id).orElse(null);
        if (current == null) return new MutationResult.NotFound();
        try {
            boolean changed = change.test(current);
            var view = changed ? repository.save(current).view() : current.view();
            if (changed) events.publishEvent(completedEvent.apply(view));
            return new MutationResult.Changed(view);
        } catch (Space.ArchivedMutation archived) {
            return new MutationResult.Archived();
        }
    }

    @Override
    public LookupResult archive(ActorId actor, SpaceId space) {
        return status(actor, space, Status.ARCHIVED);
    }

    @Override
    public LookupResult restore(ActorId actor, SpaceId space) {
        return status(actor, space, Status.ACTIVE);
    }

    private LookupResult status(ActorId actor, SpaceId id, Status status) {
        var current = repository.lock(id);
        if (current.isEmpty()) return new LookupResult.NotFound();
        boolean changed = status == Status.ARCHIVED
                ? current.orElseThrow().archive(actor)
                : current.orElseThrow().restore(actor);
        var view = changed
                ? repository.save(current.orElseThrow()).view()
                : current.orElseThrow().view();
        if (changed) {
            events.publishEvent(
                    status == Status.ARCHIVED
                            ? new SpaceEvents.Archived(actor, view)
                            : new SpaceEvents.Restored(actor, view));
        }
        return new LookupResult.Found(view);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<View> view(SpaceId space) {
        return repository.find(space).map(Space::view);
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> listByTenant(UUID tenantId) {
        return repository.findByTenant(tenantId).stream().map(Space::view).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page pageByTenant(UUID tenantId, String cursor, int limit, Optional<Status> status, Optional<Mode> mode) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Optional<KeysetCursor> decoded = KeysetCursor.decode(cursor);
        var rows = repository.pageByTenant(
                tenantId,
                decoded.map(KeysetCursor::at).orElse(null),
                decoded.map(KeysetCursor::id).orElse(null),
                limit + 1,
                status.orElse(null),
                mode.orElse(null));
        var window =
                PageWindow.of(rows, limit, row -> KeysetCursor.encode(row.view().updatedAt(), row.id()));
        return new Page(window.items().stream().map(Space::view).toList(), window.nextCursor());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> tenantOf(SpaceId space) {
        return repository.find(space).map(Space::tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Status> status(SpaceId space) {
        return view(space).map(View::status);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Mode> mode(SpaceId space) {
        return view(space).map(View::mode);
    }

    @Override
    public PlacementResult place(SpaceId space, UUID item, String slug) {
        final ResourcePath normalized;
        try {
            normalized = new ResourcePath(slug);
        } catch (IllegalArgumentException invalid) {
            return new PlacementResult.SlugInvalid();
        }
        var owner = repository.lock(space);
        if (owner.isEmpty()) return new PlacementResult.SpaceNotFound();
        if (owner.orElseThrow().view().status() == Status.ARCHIVED) {
            return new PlacementResult.SpaceArchived();
        }
        var existing = repository.placementOf(item);
        if (existing.isPresent()) return new PlacementResult.ItemAlreadyPlaced(existing.orElseThrow());
        if (pathTaken(space, normalized, null)) return new PlacementResult.SlugTaken();
        var placed = repository.insertPlacement(space, item, normalized);
        if (placed.isPresent()) {
            events.publishEvent(new SpaceEvents.Placed(placed.orElseThrow()));
            return new PlacementResult.Placed(placed.orElseThrow());
        }
        existing = repository.placementOf(item);
        if (existing.isPresent()) return new PlacementResult.ItemAlreadyPlaced(existing.orElseThrow());
        return new PlacementResult.SlugTaken();
    }

    @Override
    public PlacementResult reslug(SpaceId space, UUID item, String newSlug) {
        final ResourcePath normalized;
        try {
            normalized = new ResourcePath(newSlug);
        } catch (IllegalArgumentException invalid) {
            return new PlacementResult.SlugInvalid();
        }
        var owner = repository.lock(space);
        if (owner.isEmpty()) return new PlacementResult.SpaceNotFound();
        if (owner.orElseThrow().view().status() == Status.ARCHIVED) {
            return new PlacementResult.SpaceArchived();
        }
        var current = repository.placementOf(item);
        if (current.isEmpty() || !current.orElseThrow().space().equals(space)) {
            return new PlacementResult.ItemNotInSpace();
        }
        if (current.orElseThrow().slug().equals(normalized.value())) {
            return new PlacementResult.Placed(current.orElseThrow());
        }
        if (pathTaken(space, normalized, item)) return new PlacementResult.SlugTaken();
        var updated = repository.updatePlacementSlug(space, item, normalized);
        if (updated.isPresent()) {
            events.publishEvent(new SpaceEvents.Reslugged(updated.orElseThrow()));
            return new PlacementResult.Placed(updated.orElseThrow());
        }
        if (repository.placementAt(space, normalized).isPresent()) return new PlacementResult.SlugTaken();
        return new PlacementResult.ItemNotInSpace();
    }

    @Override
    public TransferResult transfer(UUID item, SpaceId toSpace, String slug) {
        final ResourcePath normalized;
        try {
            normalized = new ResourcePath(slug);
        } catch (IllegalArgumentException invalid) {
            return new TransferResult.SlugInvalid();
        }
        var current = repository.placementOf(item);
        if (current.isEmpty()) return new TransferResult.ItemNotPlaced();
        SpaceId fromSpace = current.orElseThrow().space();
        if (fromSpace.equals(toSpace)) return new TransferResult.SameSpace();
        SpaceId first = fromSpace.value().compareTo(toSpace.value()) < 0 ? fromSpace : toSpace;
        SpaceId second = first.equals(fromSpace) ? toSpace : fromSpace;
        var lockedFirst = repository.lock(first);
        var lockedSecond = repository.lock(second);
        if (lockedSecond.isEmpty() && second.equals(toSpace)) return new TransferResult.SpaceNotFound();
        if (lockedFirst.isEmpty() && first.equals(toSpace)) return new TransferResult.SpaceNotFound();
        if (lockedFirst.isEmpty() || lockedSecond.isEmpty()) return new TransferResult.ItemNotPlaced();
        var dest = first.equals(toSpace) ? lockedFirst.orElseThrow() : lockedSecond.orElseThrow();
        var source = first.equals(fromSpace) ? lockedFirst.orElseThrow() : lockedSecond.orElseThrow();
        if (dest.view().status() == Status.ARCHIVED || source.view().status() == Status.ARCHIVED) {
            return new TransferResult.SpaceArchived();
        }
        var fresh = repository.placementOf(item);
        if (fresh.isEmpty() || !fresh.orElseThrow().space().equals(fromSpace)) {
            return new TransferResult.ItemNotPlaced();
        }
        if (pathTaken(toSpace, normalized, null)) return new TransferResult.SlugTaken();
        var moved = repository.transferPlacement(item, fromSpace, toSpace, normalized);
        if (moved.isEmpty()) {
            if (repository.placementAt(toSpace, normalized).isPresent()) return new TransferResult.SlugTaken();
            return new TransferResult.ItemNotPlaced();
        }
        events.publishEvent(new SpaceEvents.Transferred(fresh.orElseThrow(), moved.orElseThrow()));
        return new TransferResult.Transferred(fresh.orElseThrow(), moved.orElseThrow());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SpaceId> spaceOf(java.util.UUID item) {
        return repository.placementOf(item).map(Placement::space);
    }

    private boolean pathTaken(SpaceId space, ResourcePath path, UUID except) {
        if (repository
                .placementAt(space, path)
                .filter(p -> !p.item().equals(except))
                .isPresent()) return true;
        return repository.placementsOf(space).stream()
                .filter(p -> !p.item().equals(except))
                .anyMatch(p -> path.conflictsWith(new ResourcePath(p.slug())));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<java.util.UUID> itemAt(SpaceId space, String slug) {
        final ResourcePath path;
        try {
            path = new ResourcePath(slug);
        } catch (IllegalArgumentException invalid) {
            return Optional.empty();
        }
        return repository.placementAt(space, path).map(Placement::item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Placement> itemsOf(SpaceId space) {
        return repository.placementsOf(space);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Placement> placementsOf(java.util.Set<UUID> items) {
        return repository.placementsOfItems(java.util.Set.copyOf(items));
    }

    @Override
    public Optional<View> lock(SpaceId space) {
        return repository.lock(space).map(Space::view);
    }

    @Override
    public boolean delete(SpaceId id) {
        var current = repository.lock(id);
        if (current.isEmpty()) return true;
        if (current.orElseThrow().view().status() != Status.ARCHIVED) return false;
        repository.delete(id);
        return true;
    }

    @Override
    public void unplace(UUID item) {
        repository.unplace(item);
    }
}
