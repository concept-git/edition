package io.space.concepts.collection.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.collection.api.*;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/** 深度、环、同父重名、非空删除、place 唯一归属：内存树不变量。 */
class CollectionTreeTest {
    @Test
    void rootChildrenAreDepthOneAndFourthLevelIsRejected() {
        CollectionTree tree = empty();
        CollectionTree.Node root = tree.add(null, name("产品"), null, 0);
        assertThat(root.depth).isEqualTo(1);
        CollectionTree.Node mid = tree.add(root.id, name("平台"), null, 0);
        CollectionTree.Node leaf = tree.add(mid.id, name("API"), null, 0);
        assertThat(leaf.depth).isEqualTo(3);
        assertThatThrownBy(() -> tree.add(leaf.id, name("too deep"), null, 0))
                .isInstanceOf(CollectionTree.DepthExceeded.class);
    }

    @Test
    void movingUnderSelfIsACycleAndSiblingNamesStayUnique() {
        CollectionTree tree = empty();
        CollectionTree.Node parent = tree.add(null, name("父"), null, 0);
        CollectionTree.Node child = tree.add(parent.id, name("子"), null, 0);
        assertThatThrownBy(() -> tree.move(parent.id, child.id, 0)).isInstanceOf(CollectionTree.CycleDetected.class);
        tree.add(null, name("其它"), null, 1);
        assertThatThrownBy(() -> tree.add(null, name("父"), null, 2)).isInstanceOf(CollectionTree.NameTaken.class);
        tree.add(child.id, name("父"), null, 0);
        assertThat(tree.node(child.id).children).extracting(node -> node.name).containsExactly("父");
    }

    @Test
    void placeMovesBetweenGroupsAndRemoveRejectsNonEmpty() {
        CollectionTree tree = empty();
        CollectionTree.Node first = tree.add(null, name("一组"), null, 0);
        CollectionTree.Node second = tree.add(null, name("二组"), null, 1);
        UUID space = UUID.randomUUID();
        tree.place(space, first.id, 0);
        assertThat(tree.itemsIn(first.id)).containsExactly(space);
        assertThat(tree.pathOf(space)).containsExactly("一组");
        tree.place(space, second.id, 0);
        assertThat(tree.itemsIn(first.id)).isEmpty();
        assertThat(tree.itemsIn(second.id)).containsExactly(space);
        assertThat(tree.collectionOf(space)).contains(second.id);
        assertThatThrownBy(() -> tree.remove(second.id)).isInstanceOf(CollectionTree.NotEmpty.class);
        tree.unplace(space);
        assertThat(tree.pathOf(space)).isEmpty();
        tree.remove(second.id);
        assertThat(tree.views()).extracting(view -> view.name()).containsExactly("一组");
    }

    @Test
    void memberOrderIsDenseAndUnplaceIsIdempotent() {
        CollectionTree tree = empty();
        CollectionTree.Node group = tree.add(null, name("组"), null, 0);
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        tree.place(a, group.id, 0);
        tree.place(b, group.id, 1);
        tree.place(a, group.id, 1);
        assertThat(tree.itemsIn(group.id)).containsExactly(b, a);
        tree.unplace(UUID.randomUUID());
        tree.unplace(b);
        assertThat(tree.itemsIn(group.id)).containsExactly(a);
    }

    @Test
    void siblingPositionsStayDenseAfterInsertAndSameParentMove() {
        CollectionTree tree = empty();
        CollectionTree.Node first = tree.add(null, name("甲"), null, 0);
        CollectionTree.Node second = tree.add(null, name("乙"), null, 1);
        CollectionTree.Node inserted = tree.add(null, name("丙"), null, 1);
        assertThat(tree.roots()).extracting(node -> node.name).containsExactly("甲", "丙", "乙");
        assertThat(tree.roots()).extracting(node -> node.position).containsExactly(0, 1, 2);
        tree.move(inserted.id, null, 2);
        assertThat(tree.roots()).extracting(node -> node.name).containsExactly("甲", "乙", "丙");
        assertThat(List.of(first.position, second.position, inserted.position)).containsExactly(0, 1, 2);
    }

    @Test
    void movingATallSubtreePastMaxDepthUsesHeightNotJustNewDepth() {
        CollectionTree tree = empty();
        CollectionTree.Node tall = tree.add(null, name("高"), null, 0);
        CollectionTree.Node mid = tree.add(tall.id, name("中"), null, 0);
        tree.add(mid.id, name("叶"), null, 0);
        CollectionTree.Node other = tree.add(null, name("旁"), null, 1);
        assertThat(tall.height()).isEqualTo(3);
        assertThatThrownBy(() -> tree.move(tall.id, other.id, 0)).isInstanceOf(CollectionTree.DepthExceeded.class);
        tree.move(mid.id, other.id, 0);
        assertThat(tree.node(mid.id).depth).isEqualTo(2);
    }

    @Test
    void rejectedMovePreservesPlacementAndDenseOrder() {
        CollectionTree tree = empty();
        var first = tree.add(null, name("甲"), null, 0);
        tree.add(null, name("乙"), null, 1);
        var parent = tree.add(null, name("父"), null, 2);
        tree.add(parent.id, name("甲"), null, 0);
        var before = tree.views();
        assertThatThrownBy(() -> tree.move(first.id, null, 2 + 1)).isInstanceOf(CollectionTree.PositionInvalid.class);
        assertThat(tree.views()).isEqualTo(before);
        assertThatThrownBy(() -> tree.move(first.id, parent.id, 0)).isInstanceOf(CollectionTree.NameTaken.class);
        assertThat(tree.views()).isEqualTo(before);
    }

    @Test
    void rejectedPlacePreservesOriginalMembershipAndOrder() {
        CollectionTree tree = empty();
        var source = tree.add(null, name("源"), null, 0);
        var target = tree.add(null, name("目标"), null, 1);
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();
        tree.place(first, source.id, 0);
        tree.place(second, source.id, 1);
        assertThatThrownBy(() -> tree.place(first, source.id, 2)).isInstanceOf(CollectionTree.PositionInvalid.class);
        assertThat(tree.itemsIn(source.id)).containsExactly(first, second);
        assertThatThrownBy(() -> tree.place(first, target.id, 1)).isInstanceOf(CollectionTree.PositionInvalid.class);
        assertThat(tree.itemsIn(source.id)).containsExactly(first, second);
        assertThat(tree.itemsIn(target.id)).isEmpty();
        assertThat(tree.collectionOf(first)).contains(source.id);
    }

    private static CollectionTree empty() {
        return new CollectionTree(UUID.randomUUID(), List.of(), List.of());
    }

    private static CollectionName name(String value) {
        return new CollectionName(value);
    }
}
