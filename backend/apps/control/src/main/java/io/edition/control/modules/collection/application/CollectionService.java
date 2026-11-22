package io.edition.control.modules.collection.application;

import io.edition.control.modules.collection.api.*;
import io.edition.control.modules.collection.api.CollectionApi;
import io.edition.control.modules.collection.api.CollectionEvents;
import io.edition.control.modules.collection.domain.CollectionName;
import io.edition.control.modules.collection.domain.CollectionRepository;
import io.edition.control.modules.collection.domain.CollectionTree;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Collection 动作实现：先锁租户分组行再变异内存树，同一事务把稠密序写回。 */
@Service
@Transactional
class CollectionService implements CollectionApi {
    private final CollectionRepository repository;
    private final ApplicationEventPublisher events;

    CollectionService(CollectionRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    @Override
    public CreateResult create(UUID tenant, CollectionId parent, String name, IconKey icon, Integer pos) {
        CollectionTree tree = locked(tenant);
        CollectionName parsed;
        try {
            parsed = new CollectionName(name);
        } catch (CollectionName.Invalid ignored) {
            return new CreateResult.Invalid("name", "invalid_format");
        }
        UUID parentId = parent == null ? null : parent.value();
        if (parentId != null && tree.node(parentId) == null) return new CreateResult.ParentNotFound();
        int index = pos == null ? tree.siblingCount(parentId) : pos;
        try {
            CollectionTree.Node created = tree.add(parentId, parsed, icon, index);
            repository.insert(created.stored());
            persistSiblings(tree, created.parentId);
            events.publishEvent(new CollectionEvents.Created(tenant, created.id));
            return new CreateResult.Created(created.view());
        } catch (CollectionTree.DepthExceeded ignored) {
            return new CreateResult.DepthExceeded();
        } catch (CollectionTree.PositionInvalid ignored) {
            return new CreateResult.PositionInvalid();
        } catch (CollectionTree.NameTaken ignored) {
            return new CreateResult.NameTaken();
        }
    }

    @Override
    public RenameResult rename(CollectionId col, String name) {
        Optional<CollectionTree.StoredCollection> found = repository.find(col.value());
        if (found.isEmpty()) return new RenameResult.NotFound();
        CollectionName parsed;
        try {
            parsed = new CollectionName(name);
        } catch (CollectionName.Invalid ignored) {
            return new RenameResult.Invalid("name", "invalid_format");
        }
        CollectionTree tree = locked(found.orElseThrow().tenantId());
        try {
            tree.rename(col.value(), parsed);
            repository.updateName(col.value(), parsed.value());
            events.publishEvent(new CollectionEvents.Renamed(tree.tenantId(), col.value()));
            return new RenameResult.Renamed(tree.views());
        } catch (CollectionTree.NameTaken ignored) {
            return new RenameResult.NameTaken();
        } catch (CollectionTree.NotFound ignored) {
            return new RenameResult.NotFound();
        }
    }

    @Override
    public SetIconResult setIcon(CollectionId col, IconKey icon) {
        Optional<CollectionTree.StoredCollection> found = repository.find(col.value());
        if (found.isEmpty()) return new SetIconResult.NotFound();
        CollectionTree tree = locked(found.orElseThrow().tenantId());
        try {
            tree.setIcon(col.value(), icon);
            repository.updateIcon(col.value(), icon == null ? null : icon.value());
            events.publishEvent(new CollectionEvents.IconChanged(tree.tenantId(), col.value()));
            return new SetIconResult.Changed(tree.views());
        } catch (CollectionTree.NotFound ignored) {
            return new SetIconResult.NotFound();
        }
    }

    @Override
    public MoveResult move(CollectionId col, CollectionId newParent, int pos) {
        Optional<CollectionTree.StoredCollection> found = repository.find(col.value());
        if (found.isEmpty()) return new MoveResult.NotFound();
        CollectionTree tree = locked(found.orElseThrow().tenantId());
        if (tree.node(col.value()) == null) return new MoveResult.NotFound();
        UUID parentId = newParent == null ? null : newParent.value();
        if (parentId != null && tree.node(parentId) == null) return new MoveResult.NotFound();
        UUID oldParent = tree.node(col.value()).parentId;
        try {
            tree.move(col.value(), parentId, pos);
            repository.updatePlacement(col.value(), parentId, tree.node(col.value()).position);
            persistSiblings(tree, oldParent);
            if (!Objects.equals(oldParent, parentId)) persistSiblings(tree, parentId);
            events.publishEvent(new CollectionEvents.Moved(tree.tenantId(), col.value()));
            return new MoveResult.Moved(tree.views());
        } catch (CollectionTree.DepthExceeded ignored) {
            return new MoveResult.DepthExceeded();
        } catch (CollectionTree.CycleDetected ignored) {
            return new MoveResult.CycleDetected();
        } catch (CollectionTree.PositionInvalid ignored) {
            return new MoveResult.PositionInvalid();
        } catch (CollectionTree.NameTaken ignored) {
            return new MoveResult.NameTaken();
        } catch (CollectionTree.NotFound ignored) {
            return new MoveResult.NotFound();
        }
    }

    @Override
    public PlaceResult place(UUID item, CollectionId col, Integer pos) {
        Optional<CollectionTree.StoredCollection> found = repository.find(col.value());
        if (found.isEmpty()) return new PlaceResult.NotFound();
        CollectionTree tree = locked(found.orElseThrow().tenantId());
        if (tree.node(col.value()) == null) return new PlaceResult.NotFound();
        UUID previous = tree.collectionOf(item).orElse(null);
        int index = pos == null ? tree.memberCount(col.value()) - (col.value().equals(previous) ? 1 : 0) : pos;
        try {
            tree.place(item, col.value(), index);
            persistMembers(tree, previous);
            if (!col.value().equals(previous)) persistMembers(tree, col.value());
            events.publishEvent(new CollectionEvents.Placed(tree.tenantId(), col.value(), item));
            return new PlaceResult.Placed(tree.itemsIn(col.value()));
        } catch (CollectionTree.PositionInvalid ignored) {
            return new PlaceResult.PositionInvalid();
        } catch (CollectionTree.NotFound ignored) {
            return new PlaceResult.NotFound();
        }
    }

    @Override
    public UnplaceResult unplace(UUID item) {
        Optional<CollectionTree.StoredMembership> existing = repository.membershipOf(item);
        if (existing.isEmpty()) return new UnplaceResult.Unplaced();
        Optional<CollectionTree.StoredCollection> owner =
                repository.find(existing.orElseThrow().collectionId());
        if (owner.isEmpty()) {
            return new UnplaceResult.Unplaced();
        }
        CollectionTree tree = locked(owner.orElseThrow().tenantId());
        UUID collectionId = tree.collectionOf(item).orElse(null);
        tree.unplace(item);
        repository.deleteMembership(item);
        persistMembers(tree, collectionId);
        events.publishEvent(new CollectionEvents.Unplaced(tree.tenantId(), item));
        return new UnplaceResult.Unplaced();
    }

    @Override
    public RemoveResult remove(CollectionId col) {
        Optional<CollectionTree.StoredCollection> found = repository.find(col.value());
        if (found.isEmpty()) return new RemoveResult.NotFound();
        CollectionTree tree = locked(found.orElseThrow().tenantId());
        if (tree.node(col.value()) == null) return new RemoveResult.NotFound();
        UUID parentId = tree.node(col.value()).parentId;
        try {
            tree.remove(col.value());
            repository.delete(col.value());
            persistSiblings(tree, parentId);
            events.publishEvent(new CollectionEvents.Removed(tree.tenantId(), col.value()));
            return new RemoveResult.Removed(tree.views());
        } catch (CollectionTree.NotEmpty ignored) {
            return new RemoveResult.NotEmpty();
        } catch (CollectionTree.NotFound ignored) {
            return new RemoveResult.NotFound();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> tree(UUID tenant) {
        return new CollectionTree(tenant, repository.list(tenant), repository.memberships(tenant)).views();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UUID> itemsIn(CollectionId col) {
        Optional<CollectionTree.StoredCollection> found = repository.find(col.value());
        if (found.isEmpty()) return List.of();
        return loaded(found.orElseThrow()).itemsIn(col.value());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> pathOf(UUID item) {
        Optional<CollectionTree.StoredMembership> membership = repository.membershipOf(item);
        if (membership.isEmpty()) return List.of();
        Optional<CollectionTree.StoredCollection> owner =
                repository.find(membership.orElseThrow().collectionId());
        if (owner.isEmpty()) return List.of();
        return loaded(owner.orElseThrow()).pathOf(item);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> collectionOf(UUID item) {
        return repository.membershipOf(item).map(CollectionTree.StoredMembership::collectionId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> tenantOf(CollectionId col) {
        return repository.find(col.value()).map(CollectionTree.StoredCollection::tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<UUID> placed(UUID tenant) {
        return new CollectionTree(tenant, repository.list(tenant), repository.memberships(tenant)).placed();
    }

    private CollectionTree locked(UUID tenant) {
        return new CollectionTree(tenant, repository.lockTenant(tenant), repository.lockMemberships(tenant));
    }

    private CollectionTree loaded(CollectionTree.StoredCollection owner) {
        return new CollectionTree(
                owner.tenantId(), repository.list(owner.tenantId()), repository.memberships(owner.tenantId()));
    }

    private void persistSiblings(CollectionTree tree, UUID parentId) {
        List<CollectionTree.Node> siblings = parentId == null
                ? tree.roots()
                : tree.node(parentId) == null ? List.of() : tree.node(parentId).children;
        for (CollectionTree.Node sibling : siblings) {
            repository.updatePlacement(sibling.id, sibling.parentId, sibling.position);
        }
    }

    private void persistMembers(CollectionTree tree, UUID collectionId) {
        if (collectionId == null || tree.node(collectionId) == null) return;
        for (CollectionTree.Membership member : tree.node(collectionId).members) {
            repository.upsertMembership(member.stored());
        }
    }
}
