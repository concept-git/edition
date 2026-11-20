package io.space.concepts.collection.domain;

import io.space.concepts.collection.api.*;
import io.space.concepts.collection.api.CollectionApi;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/** 一租户分组森林：深度、环、序、同父重名、非空删除与唯一归属集中于此。 */
public final class CollectionTree {
    private final UUID tenantId;
    private final Map<UUID, Node> nodes = new LinkedHashMap<>();
    private final List<Node> roots = new ArrayList<>();
    private final Map<UUID, Membership> memberships = new LinkedHashMap<>();

    public CollectionTree(UUID tenantId, List<StoredCollection> collections, List<StoredMembership> stored) {
        this.tenantId = Objects.requireNonNull(tenantId, "tenant id");
        for (StoredCollection collection : collections) {
            nodes.put(collection.id(), new Node(collection));
        }
        for (Node node : nodes.values()) {
            if (node.parentId == null) {
                roots.add(node);
            } else {
                Node parent = nodes.get(node.parentId);
                if (parent == null) throw new IllegalStateException("dangling collection parent");
                parent.children.add(node);
            }
        }
        roots.sort(Node.BY_POSITION);
        for (Node node : nodes.values()) {
            node.children.sort(Node.BY_POSITION);
        }
        assignDepths(roots, 1);
        for (StoredMembership row : stored) {
            Node owner = nodes.get(row.collectionId());
            if (owner == null) throw new IllegalStateException("dangling collection membership");
            Membership membership = new Membership(row.spaceId(), row.collectionId(), row.position());
            memberships.put(row.spaceId(), membership);
            owner.members.add(membership);
        }
        nodes.values().forEach(node -> node.members.sort(Membership.BY_POSITION));
    }

    public UUID tenantId() {
        return tenantId;
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

    public int memberCount(UUID collectionId) {
        return nodes.get(collectionId).members.size();
    }

    public Node add(UUID parentId, CollectionName name, CollectionApi.IconKey icon, int pos) {
        List<Node> siblings = siblingsOf(parentId);
        if (pos < 0 || pos > siblings.size()) throw new PositionInvalid();
        requireUniqueName(siblings, name.value(), null);
        int parentDepth = parentId == null ? 0 : nodes.get(parentId).depth;
        int depth = parentDepth + 1;
        if (depth > CollectionApi.MAX_DEPTH) throw new DepthExceeded();
        Node created = new Node(UUID.randomUUID(), tenantId, parentId, pos, name.value(), icon, depth);
        siblings.add(pos, created);
        reindex(siblings);
        nodes.put(created.id, created);
        return created;
    }

    public void rename(UUID collectionId, CollectionName name) {
        Node node = require(collectionId);
        requireUniqueName(siblingsOf(node.parentId), name.value(), collectionId);
        node.name = name.value();
    }

    public void setIcon(UUID collectionId, CollectionApi.IconKey icon) {
        require(collectionId).icon = icon;
    }

    public void move(UUID collectionId, UUID newParentId, int pos) {
        Node node = require(collectionId);
        if (newParentId != null) {
            Node parent = nodes.get(newParentId);
            if (parent == null) throw new NotFound();
            if (collectionId.equals(newParentId) || isDescendant(node, newParentId)) throw new CycleDetected();
        }
        int parentDepth = newParentId == null ? 0 : nodes.get(newParentId).depth;
        int newDepth = parentDepth + 1;
        if (newDepth + node.height() - 1 > CollectionApi.MAX_DEPTH) throw new DepthExceeded();
        List<Node> oldSiblings = siblingsOf(node.parentId);
        List<Node> newSiblings = siblingsOf(newParentId);
        int count = newSiblings.size() - (oldSiblings == newSiblings ? 1 : 0);
        if (pos < 0 || pos > count) throw new PositionInvalid();
        requireUniqueName(newSiblings, node.name, collectionId);
        oldSiblings.remove(node);
        reindex(oldSiblings);
        node.parentId = newParentId;
        newSiblings.add(pos, node);
        reindex(newSiblings);
        assignDepths(roots, 1);
    }

    public void remove(UUID collectionId) {
        Node node = require(collectionId);
        if (!node.children.isEmpty() || !node.members.isEmpty()) throw new NotEmpty();
        List<Node> siblings = siblingsOf(node.parentId);
        siblings.remove(node);
        reindex(siblings);
        nodes.remove(node.id);
    }

    public void place(UUID item, UUID collectionId, int pos) {
        Node target = require(collectionId);
        Membership existing = memberships.get(item);
        int count = target.members.size() - (existing != null && existing.collectionId.equals(collectionId) ? 1 : 0);
        if (pos < 0 || pos > count) throw new PositionInvalid();
        unplace(item);
        Membership created = new Membership(item, collectionId, pos);
        target.members.add(pos, created);
        reindexMembers(target.members);
        memberships.put(item, created);
    }

    public void unplace(UUID item) {
        Membership existing = memberships.remove(item);
        if (existing == null) return;
        Node owner = nodes.get(existing.collectionId);
        owner.members.remove(existing);
        reindexMembers(owner.members);
    }

    public List<UUID> itemsIn(UUID collectionId) {
        return require(collectionId).members.stream()
                .map(member -> member.spaceId)
                .toList();
    }

    public Optional<UUID> collectionOf(UUID item) {
        Membership membership = memberships.get(item);
        return membership == null ? Optional.empty() : Optional.of(membership.collectionId);
    }

    public List<String> pathOf(UUID item) {
        Optional<UUID> collectionId = collectionOf(item);
        if (collectionId.isEmpty()) return List.of();
        List<String> chain = new ArrayList<>();
        Node cursor = nodes.get(collectionId.get());
        while (cursor != null) {
            chain.add(cursor.name);
            cursor = cursor.parentId == null ? null : nodes.get(cursor.parentId);
        }
        return chain.reversed();
    }

    public Set<UUID> placed() {
        return Set.copyOf(memberships.keySet());
    }

    public List<CollectionApi.View> views() {
        return roots.stream().map(Node::view).toList();
    }

    public List<Node> all() {
        return List.copyOf(nodes.values());
    }

    private Node require(UUID collectionId) {
        Node node = nodes.get(collectionId);
        if (node == null) throw new NotFound();
        return node;
    }

    private List<Node> siblingsOf(UUID parentId) {
        if (parentId == null) return roots;
        Node parent = nodes.get(parentId);
        if (parent == null) throw new NotFound();
        return parent.children;
    }

    private static void requireUniqueName(List<Node> siblings, String name, UUID ignoreId) {
        for (Node sibling : siblings) {
            if ((ignoreId == null || !sibling.id.equals(ignoreId)) && sibling.name.equals(name)) {
                throw new NameTaken();
            }
        }
    }

    private static boolean isDescendant(Node ancestor, UUID candidate) {
        for (Node child : ancestor.children) {
            if (child.id.equals(candidate) || isDescendant(child, candidate)) return true;
        }
        return false;
    }

    private static void reindex(List<Node> siblings) {
        for (int index = 0; index < siblings.size(); index++) {
            siblings.get(index).position = index;
        }
    }

    private static void reindexMembers(List<Membership> members) {
        for (int index = 0; index < members.size(); index++) {
            members.get(index).position = index;
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

    public static final class NameTaken extends RuntimeException {}

    public static final class NotEmpty extends RuntimeException {}

    public static final class NotFound extends RuntimeException {}

    public static final class Node {
        private static final java.util.Comparator<Node> BY_POSITION =
                java.util.Comparator.comparingInt((Node node) -> node.position).thenComparing(node -> node.id);
        public final UUID id;
        public final UUID tenantId;
        public UUID parentId;
        public int position;
        public String name;
        public CollectionApi.IconKey icon;
        public int depth;
        public final List<Node> children = new ArrayList<>();
        public final List<Membership> members = new ArrayList<>();

        Node(StoredCollection stored) {
            this.id = stored.id();
            this.tenantId = stored.tenantId();
            this.parentId = stored.parentId();
            this.position = stored.position();
            this.name = stored.name();
            this.icon = stored.icon();
        }

        Node(UUID id, UUID tenantId, UUID parentId, int position, String name, CollectionApi.IconKey icon, int depth) {
            this.id = id;
            this.tenantId = tenantId;
            this.parentId = parentId;
            this.position = position;
            this.name = name;
            this.icon = icon;
            this.depth = depth;
        }

        public int height() {
            int max = 1;
            for (Node child : children) {
                max = Math.max(max, 1 + child.height());
            }
            return max;
        }

        public CollectionApi.View view() {
            return new CollectionApi.View(
                    id,
                    tenantId,
                    parentId,
                    position,
                    name,
                    icon,
                    depth,
                    children.stream().map(Node::view).toList());
        }

        public StoredCollection stored() {
            return new StoredCollection(id, tenantId, parentId, position, name, icon);
        }
    }

    public static final class Membership {
        private static final java.util.Comparator<Membership> BY_POSITION = java.util.Comparator.comparingInt(
                        (Membership member) -> member.position)
                .thenComparing(member -> member.spaceId);
        public final UUID spaceId;
        public UUID collectionId;
        public int position;

        Membership(UUID spaceId, UUID collectionId, int position) {
            this.spaceId = spaceId;
            this.collectionId = collectionId;
            this.position = position;
        }

        public StoredMembership stored() {
            return new StoredMembership(spaceId, collectionId, position);
        }
    }

    public record StoredCollection(
            UUID id, UUID tenantId, UUID parentId, int position, String name, CollectionApi.IconKey icon) {}

    public record StoredMembership(UUID spaceId, UUID collectionId, int position) {}
}
