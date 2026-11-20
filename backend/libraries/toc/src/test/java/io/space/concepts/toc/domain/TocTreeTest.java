package io.space.concepts.toc.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.toc.api.*;
import io.space.concepts.toc.api.TocApi;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/** 深度、环、级联摘子树：内存树的不变量，不碰持久化。 */
class TocTreeTest {
    @Test
    void rootChildrenAreDepthOneAndEighthLevelIsRejected() {
        UUID space = UUID.randomUUID();
        TocTree tree = new TocTree(space, List.of());
        TocTree.Node root = tree.add(null, new TocLabel("指南"), TocApi.Kind.GROUP, null, null, 0);
        assertThat(root.depth).isEqualTo(1);
        TocTree.Node cursor = root;
        for (int depth = 2; depth <= 7; depth++) {
            cursor = tree.add(cursor.id, new TocLabel("L" + depth), TocApi.Kind.GROUP, null, null, 0);
            assertThat(cursor.depth).isEqualTo(depth);
        }
        UUID deepest = cursor.id;
        assertThatThrownBy(() -> tree.add(deepest, new TocLabel("too deep"), TocApi.Kind.GROUP, null, null, 0))
                .isInstanceOf(TocTree.DepthExceeded.class);
    }

    @Test
    void movingUnderSelfIsACycleAndRemoveDropsDescendants() {
        UUID space = UUID.randomUUID();
        TocTree tree = new TocTree(space, List.of());
        TocTree.Node group = tree.add(null, new TocLabel("组"), TocApi.Kind.GROUP, null, null, 0);
        TocTree.Node child = tree.add(group.id, new TocLabel("子"), TocApi.Kind.GROUP, null, null, 0);
        assertThatThrownBy(() -> tree.move(group.id, child.id, 0)).isInstanceOf(TocTree.CycleDetected.class);
        tree.remove(group.id);
        assertThat(tree.views()).isEmpty();
    }

    @Test
    void rejectedMovePreservesTreeAndPositions() {
        TocTree tree = new TocTree(UUID.randomUUID(), List.of());
        var first = tree.add(null, new TocLabel("甲"), TocApi.Kind.GROUP, null, null, 0);
        tree.add(null, new TocLabel("乙"), TocApi.Kind.GROUP, null, null, 1);
        var before = tree.views();
        assertThatThrownBy(() -> tree.move(first.id, null, 2)).isInstanceOf(TocTree.PositionInvalid.class);
        assertThat(tree.views()).isEqualTo(before);
        tree.move(first.id, null, 1);
        assertThat(tree.roots()).extracting(node -> node.label).containsExactly("乙", "甲");
        assertThat(tree.roots()).extracting(node -> node.position).containsExactly(0, 1);
    }

    @Test
    void rejectedReplacePreservesOriginalTree() {
        TocTree tree = new TocTree(UUID.randomUUID(), List.of());
        tree.add(null, new TocLabel("原树"), TocApi.Kind.GROUP, null, null, 0);
        var before = tree.views();
        TocApi.Draft deep = new TocApi.Draft("叶", TocApi.Kind.GROUP, null, null, List.of());
        for (int i = 0; i < TocApi.MAX_DEPTH; i++) {
            deep = new TocApi.Draft("父", TocApi.Kind.GROUP, null, null, List.of(deep));
        }
        var tooDeep = List.of(deep);
        assertThatThrownBy(() -> tree.replaceWith(tooDeep)).isInstanceOf(TocTree.DepthExceeded.class);
        assertThat(tree.views()).isEqualTo(before);
        var invalid = List.of(new TocApi.Draft("", TocApi.Kind.GROUP, null, null, List.of()));
        assertThatThrownBy(() -> tree.replaceWith(invalid)).isInstanceOf(TocLabel.Invalid.class);
        assertThat(tree.views()).isEqualTo(before);
    }
}
