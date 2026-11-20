package io.space.concepts.toc.application;

import io.space.concepts.toc.api.*;
import io.space.concepts.toc.api.TocApi;
import io.space.concepts.toc.api.TocEvents;
import io.space.concepts.toc.domain.KindBinding;
import io.space.concepts.toc.domain.TocLabel;
import io.space.concepts.toc.domain.TocRepository;
import io.space.concepts.toc.domain.TocTree;
import io.space.concepts.toc.domain.TocUrl;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Toc 动作实现：先锁空间行再变异内存树，同一事务把稠密序写回；超深/环是有限输出不是异常。 */
@Service
@Transactional
class TocService implements TocApi {
    private final TocRepository repository;
    private final ApplicationEventPublisher events;

    TocService(TocRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    @Override
    public AddResult addEntry(
            TocId toc, EntryId parent, String label, Kind kind, UUID targetId, String url, Integer pos) {
        TocTree tree = locked(toc);
        TocLabel parsedLabel;
        String parsedUrl;
        try {
            parsedLabel = new TocLabel(label);
            parsedUrl = kind == Kind.LINK ? new TocUrl(url).value() : null;
            KindBinding.require(kind, targetId, kind == Kind.LINK ? parsedUrl : url);
        } catch (TocLabel.Invalid ignored) {
            return new AddResult.Invalid("label", "invalid_format");
        } catch (TocUrl.Invalid ignored) {
            return new AddResult.Invalid("url", "invalid_format");
        } catch (KindBinding.Invalid invalid) {
            return new AddResult.Invalid(invalid.field, invalid.code);
        }
        if (parent != null && tree.node(parent.value()) == null) return new AddResult.ParentNotFound();
        int index = pos == null ? tree.siblingCount(parent == null ? null : parent.value()) : pos;
        try {
            TocTree.Node created =
                    tree.add(parent == null ? null : parent.value(), parsedLabel, kind, targetId, parsedUrl, index);
            repository.insert(created.stored());
            persistSiblings(tree, created.parentId);
            events.publishEvent(new TocEvents.EntryAdded(toc.spaceId(), created.id));
            return new AddResult.Added(created.view());
        } catch (TocTree.DepthExceeded ignored) {
            return new AddResult.DepthExceeded();
        } catch (TocTree.PositionInvalid ignored) {
            return new AddResult.PositionInvalid();
        }
    }

    @Override
    public MoveResult move(EntryId entry, EntryId newParent, int pos) {
        Optional<TocTree.StoredEntry> found = repository.find(entry.value());
        if (found.isEmpty()) return new MoveResult.NotFound();
        TocTree tree = locked(new TocId(found.orElseThrow().spaceId()));
        if (tree.node(entry.value()) == null) return new MoveResult.NotFound();
        UUID parentId = newParent == null ? null : newParent.value();
        if (parentId != null && tree.node(parentId) == null) return new MoveResult.NotFound();
        UUID oldParent = tree.node(entry.value()).parentId;
        try {
            tree.move(entry.value(), parentId, pos);
            repository.updatePlacement(entry.value(), parentId, tree.node(entry.value()).position);
            persistSiblings(tree, oldParent);
            if (!Objects.equals(oldParent, parentId)) persistSiblings(tree, parentId);
            events.publishEvent(new TocEvents.EntryMoved(tree.spaceId(), entry.value()));
            return new MoveResult.Moved(tree.views());
        } catch (TocTree.DepthExceeded ignored) {
            return new MoveResult.DepthExceeded();
        } catch (TocTree.CycleDetected ignored) {
            return new MoveResult.CycleDetected();
        } catch (TocTree.PositionInvalid ignored) {
            return new MoveResult.PositionInvalid();
        } catch (TocTree.NotFound ignored) {
            return new MoveResult.NotFound();
        }
    }

    @Override
    public RelabelResult relabel(EntryId entry, String label) {
        Optional<TocTree.StoredEntry> found = repository.find(entry.value());
        if (found.isEmpty()) return new RelabelResult.NotFound();
        TocLabel parsed;
        try {
            parsed = new TocLabel(label);
        } catch (TocLabel.Invalid ignored) {
            return new RelabelResult.Invalid("label", "invalid_format");
        }
        TocTree tree = locked(new TocId(found.orElseThrow().spaceId()));
        if (tree.node(entry.value()) == null) return new RelabelResult.NotFound();
        tree.relabel(entry.value(), parsed);
        repository.updateLabel(entry.value(), parsed.value());
        events.publishEvent(new TocEvents.EntryRelabeled(tree.spaceId(), entry.value()));
        return new RelabelResult.Relabeled(tree.views());
    }

    @Override
    public RemoveResult remove(EntryId entry) {
        Optional<TocTree.StoredEntry> found = repository.find(entry.value());
        if (found.isEmpty()) return new RemoveResult.NotFound();
        TocTree tree = locked(new TocId(found.orElseThrow().spaceId()));
        if (tree.node(entry.value()) == null) return new RemoveResult.NotFound();
        UUID parentId = tree.node(entry.value()).parentId;
        List<UUID> ids = tree.descendantsAndSelf(entry.value()).stream()
                .map(node -> node.id)
                .toList();
        tree.remove(entry.value());
        repository.delete(ids);
        persistSiblings(tree, parentId);
        events.publishEvent(new TocEvents.EntryRemoved(tree.spaceId(), entry.value()));
        return new RemoveResult.Removed(tree.views());
    }

    @Override
    public ReplaceResult replace(TocId toc, List<Draft> tree) {
        TocTree current = locked(toc);
        try {
            // 先在内存里装完整棵；超深在写库前失败，避免清空后留下半棵树。
            current.replaceWith(tree);
        } catch (TocTree.DepthExceeded ignored) {
            return new ReplaceResult.DepthExceeded();
        } catch (TocLabel.Invalid ignored) {
            return new ReplaceResult.Invalid("label", "invalid_format");
        } catch (TocUrl.Invalid ignored) {
            return new ReplaceResult.Invalid("url", "invalid_format");
        } catch (KindBinding.Invalid invalid) {
            return new ReplaceResult.Invalid(invalid.field, invalid.code);
        }
        repository.deleteSpace(toc.spaceId());
        for (TocTree.Node node : current.all()) {
            repository.insert(node.stored());
        }
        events.publishEvent(new TocEvents.Replaced(toc.spaceId()));
        return new ReplaceResult.Replaced(current.views());
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> tree(TocId toc) {
        return new TocTree(toc.spaceId(), repository.list(toc.spaceId())).views();
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> entriesFor(UUID target) {
        return repository.entriesFor(target).stream()
                .map(entry -> new View(
                        entry.id(),
                        entry.spaceId(),
                        entry.parentId(),
                        entry.position(),
                        entry.label(),
                        entry.kind(),
                        entry.targetId(),
                        entry.url(),
                        0,
                        List.of()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Integer> depth(EntryId entry) {
        return repository
                .find(entry.value())
                .flatMap(found -> Optional.ofNullable(
                                new TocTree(found.spaceId(), repository.list(found.spaceId())).node(entry.value()))
                        .map(node -> node.depth));
    }

    /** 先取得Toc作用域锁，再读取并锁定现有行；空树也串行。 */
    private TocTree locked(TocId toc) {
        return new TocTree(toc.spaceId(), repository.lockSpace(toc.spaceId()));
    }

    /** 受影响兄弟压成稠密 0..n-1。表无 ON DELETE CASCADE，子孙必须先在 domain 删再 DML。 */
    private void persistSiblings(TocTree tree, UUID parentId) {
        List<TocTree.Node> siblings = parentId == null
                ? tree.roots()
                : tree.node(parentId) == null ? List.of() : tree.node(parentId).children;
        for (TocTree.Node sibling : siblings) {
            repository.updatePlacement(sibling.id, sibling.parentId, sibling.position);
        }
    }
}
