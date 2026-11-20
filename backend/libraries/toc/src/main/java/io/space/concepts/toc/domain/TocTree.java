package io.space.concepts.toc.domain;

import io.space.concepts.toc.api.*;
import io.space.concepts.toc.api.TocApi;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/** 一棵空间目录的内存形态：深度、环、序与级联删除的不变量集中于此。 */
public final class TocTree {
    private final UUID spaceId;
    private final Map<UUID, Node> nodes = new LinkedHashMap<>();
    private final List<Node> roots = new ArrayList<>();

    public TocTree(UUID spaceId, List<StoredEntry> entries) {
        this.spaceId = Objects.requireNonNull(spaceId, "space id");
        for (StoredEntry entry : entries) {
            nodes.put(entry.id(), new Node(entry));
        }
        for (Node node : nodes.values()) {
            if (node.parentId == null) {
                roots.add(node);
            } else {
                Node parent = nodes.get(node.parentId);
                if (parent == null) throw new IllegalStateException("dangling toc parent");
                parent.children.add(node);
            }
        }
        roots.sort(Node.BY_POSITION);
        for (Node node : nodes.values()) {
            node.children.sort(Node.BY_POSITION);
        }
        assignDepths(roots, 1);
    }

    public UUID spaceId() {
        return spaceId;
    }

    public Node node(UUID id) {
        return nodes.get(id);
    }

    public List<Node> roots() {
        return List.copyOf(roots);
    }

    public int siblingCount(UUID parentId) {
        return parentId == null ? roots.size() : nodes.get(parentId).children.size();
    }

    /** pos 合法范围 {@code 0..count}（count 表示追加）。根层 depth=1，挂到 depth=7 之下即超深。 */
    public Node add(UUID parentId, TocLabel label, TocApi.Kind kind, UUID targetId, String url, int pos) {
        KindBinding.require(kind, targetId, url);
        List<Node> siblings = siblingsOf(parentId);
        if (pos < 0 || pos > siblings.size()) throw new PositionInvalid();
        int parentDepth = parentId == null ? 0 : nodes.get(parentId).depth;
        int depth = parentDepth + 1;
        if (depth > TocApi.MAX_DEPTH) throw new DepthExceeded();
        Node created = new Node(UUID.randomUUID(), spaceId, parentId, pos, label.value(), kind, targetId, url, depth);
        siblings.add(pos, created);
        reindex(siblings);
        nodes.put(created.id, created);
        return created;
    }

    /** 新深度 + 子树高度 - 1 不得超过 7；不能挂到自身或子孙之下。 */
    public void move(UUID entryId, UUID newParentId, int pos) {
        Node node = nodes.get(entryId);
        if (node == null) throw new NotFound();
        if (newParentId != null) {
            Node parent = nodes.get(newParentId);
            if (parent == null) throw new NotFound();
            if (entryId.equals(newParentId) || isDescendant(node, newParentId)) throw new CycleDetected();
        }
        int parentDepth = newParentId == null ? 0 : nodes.get(newParentId).depth;
        int newDepth = parentDepth + 1;
        if (newDepth + node.height() - 1 > TocApi.MAX_DEPTH) throw new DepthExceeded();
        List<Node> oldSiblings = siblingsOf(node.parentId);
        List<Node> newSiblings = siblingsOf(newParentId);
        int count = newSiblings.size() - (oldSiblings == newSiblings ? 1 : 0);
        if (pos < 0 || pos > count) throw new PositionInvalid();
        oldSiblings.remove(node);
        reindex(oldSiblings);
        node.parentId = newParentId;
        newSiblings.add(pos, node);
        reindex(newSiblings);
        assignDepths(roots, 1);
    }

    public void relabel(UUID entryId, TocLabel label) {
        Node node = nodes.get(entryId);
        if (node == null) throw new NotFound();
        node.label = label.value();
    }

    /** 级联摘整棵子树，不碰指向的页面或外链。 */
    public void remove(UUID entryId) {
        Node node = nodes.get(entryId);
        if (node == null) throw new NotFound();
        List<Node> siblings = siblingsOf(node.parentId);
        siblings.remove(node);
        reindex(siblings);
        drop(node);
    }

    /** 内存整树替换；调用方必须在写库前捕获 DepthExceeded，避免半棵树落盘。 */
    public void replaceWith(List<TocApi.Draft> drafts) {
        TocTree replacement = new TocTree(spaceId, List.of());
        replacement.insertDrafts(null, drafts, 1);
        roots.clear();
        roots.addAll(replacement.roots);
        nodes.clear();
        nodes.putAll(replacement.nodes);
    }

    public List<TocApi.View> views() {
        return roots.stream().map(Node::view).toList();
    }

    public List<Node> descendantsAndSelf(UUID entryId) {
        Node node = nodes.get(entryId);
        if (node == null) return List.of();
        List<Node> collected = new ArrayList<>();
        collect(node, collected);
        return collected;
    }

    public List<Node> all() {
        return List.copyOf(nodes.values());
    }

    private void insertDrafts(UUID parentId, List<TocApi.Draft> drafts, int depth) {
        if (depth > TocApi.MAX_DEPTH && !drafts.isEmpty()) throw new DepthExceeded();
        List<Node> siblings = parentId == null ? roots : nodes.get(parentId).children;
        int position = 0;
        for (TocApi.Draft draft : drafts) {
            TocLabel label = new TocLabel(draft.label());
            String url = draft.kind() == TocApi.Kind.LINK ? new TocUrl(draft.url()).value() : null;
            KindBinding.require(draft.kind(), draft.targetId(), draft.kind() == TocApi.Kind.LINK ? url : draft.url());
            Node created = new Node(
                    UUID.randomUUID(),
                    spaceId,
                    parentId,
                    position,
                    label.value(),
                    draft.kind(),
                    draft.targetId(),
                    url,
                    depth);
            siblings.add(created);
            nodes.put(created.id, created);
            insertDrafts(created.id, draft.children(), depth + 1);
            position++;
        }
        reindex(siblings);
    }

    private List<Node> siblingsOf(UUID parentId) {
        if (parentId == null) return roots;
        Node parent = nodes.get(parentId);
        if (parent == null) throw new NotFound();
        return parent.children;
    }

    private static boolean isDescendant(Node ancestor, UUID candidate) {
        for (Node child : ancestor.children) {
            if (child.id.equals(candidate) || isDescendant(child, candidate)) return true;
        }
        return false;
    }

    private void drop(Node node) {
        for (Node child : List.copyOf(node.children)) {
            drop(child);
        }
        nodes.remove(node.id);
    }

    private static void collect(Node node, List<Node> into) {
        for (Node child : node.children) collect(child, into);
        into.add(node);
    }

    private static void reindex(List<Node> siblings) {
        for (int index = 0; index < siblings.size(); index++) {
            siblings.get(index).position = index;
        }
    }

    private static void assignDepths(List<Node> level, int depth) {
        for (Node node : level) {
            node.depth = depth;
            assignDepths(node.children, depth + 1);
        }
    }

    public static final class DepthExceeded extends RuntimeException {}

    public static final class CycleDetected extends RuntimeException {}

    public static final class PositionInvalid extends RuntimeException {}

    public static final class NotFound extends RuntimeException {}

    public static final class Node {
        private static final java.util.Comparator<Node> BY_POSITION =
                java.util.Comparator.comparingInt((Node node) -> node.position).thenComparing(node -> node.id);
        public final UUID id;
        public final UUID spaceId;
        public UUID parentId;
        public int position;
        public String label;
        public final TocApi.Kind kind;
        public final UUID targetId;
        public final String url;
        public int depth;
        public final List<Node> children = new ArrayList<>();

        Node(StoredEntry stored) {
            this.id = stored.id();
            this.spaceId = stored.spaceId();
            this.parentId = stored.parentId();
            this.position = stored.position();
            this.label = stored.label();
            this.kind = stored.kind();
            this.targetId = stored.targetId();
            this.url = stored.url();
        }

        Node(
                UUID id,
                UUID spaceId,
                UUID parentId,
                int position,
                String label,
                TocApi.Kind kind,
                UUID targetId,
                String url,
                int depth) {
            this.id = id;
            this.spaceId = spaceId;
            this.parentId = parentId;
            this.position = position;
            this.label = label;
            this.kind = kind;
            this.targetId = targetId;
            this.url = url;
            this.depth = depth;
        }

        public int height() {
            int max = 1;
            for (Node child : children) {
                max = Math.max(max, 1 + child.height());
            }
            return max;
        }

        public TocApi.View view() {
            return new TocApi.View(
                    id,
                    spaceId,
                    parentId,
                    position,
                    label,
                    kind,
                    targetId,
                    url,
                    depth,
                    children.stream().map(Node::view).toList());
        }

        public StoredEntry stored() {
            return new StoredEntry(id, spaceId, parentId, position, label, kind, targetId, url);
        }
    }

    public record StoredEntry(
            UUID id,
            UUID spaceId,
            UUID parentId,
            int position,
            String label,
            TocApi.Kind kind,
            UUID targetId,
            String url) {}
}
