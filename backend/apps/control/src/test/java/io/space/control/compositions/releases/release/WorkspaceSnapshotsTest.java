package io.space.control.compositions.releases.release;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.toc.api.TocApi;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class WorkspaceSnapshotsTest {
    @Test
    void dropsUnpublishedTargetsAndReparentsChildren() {
        UUID space = UUID.randomUUID();
        UUID published = UUID.randomUUID();
        UUID unpublished = UUID.randomUUID();
        UUID group = UUID.randomUUID();
        UUID child = UUID.randomUUID();
        UUID grandchild = UUID.randomUUID();

        TocApi.View publishedLeaf = target(space, published, "Keep", List.of());
        TocApi.View nested =
                target(space, unpublished, "Drop", List.of(target(space, grandchild, "Grandchild", List.of())));
        TocApi.View tree = group(space, group, "Group", List.of(nested, publishedLeaf));
        TocApi.View rootDrop =
                target(space, unpublished, "Root drop", List.of(target(space, child, "Child", List.of())));
        TocApi.View link = new TocApi.View(
                UUID.randomUUID(), space, null, 2, "Docs", TocApi.Kind.LINK, null, "https://example.com", 1, List.of());

        List<ReleaseApi.TocNode> projected =
                WorkspaceSnapshots.projectToc(List.of(tree, rootDrop, link), Set.of(published, child, grandchild));

        assertThat(projected).hasSize(3);
        ReleaseApi.TocNode groupNode = projected.getFirst();
        assertThat(groupNode.kind()).isEqualTo(ReleaseApi.TocKind.GROUP);
        assertThat(groupNode.children()).extracting(ReleaseApi.TocNode::label).containsExactly("Grandchild", "Keep");
        assertThat(groupNode.children().getFirst().ref()).isEqualTo(grandchild.toString());
        assertThat(projected.get(1).label()).isEqualTo("Child");
        assertThat(projected.get(1).ref()).isEqualTo(child.toString());
        assertThat(projected.get(2).kind()).isEqualTo(ReleaseApi.TocKind.LINK);
        assertThat(projected.get(2).url()).isEqualTo("https://example.com");
    }

    @Test
    void keepsAPublishedTargetAndDropsAnEmptyUnpublishedRoot() {
        UUID space = UUID.randomUUID();
        UUID page = UUID.randomUUID();
        TocApi.View keep = target(space, page, "Guide", List.of());
        TocApi.View drop = target(space, UUID.randomUUID(), "Draft", List.of());

        List<ReleaseApi.TocNode> projected = WorkspaceSnapshots.projectToc(List.of(keep, drop), Set.of(page));

        assertThat(projected).singleElement().satisfies(node -> {
            assertThat(node.kind()).isEqualTo(ReleaseApi.TocKind.TARGET);
            assertThat(node.ref()).isEqualTo(page.toString());
            assertThat(node.children()).isEmpty();
        });
    }

    private static TocApi.View target(UUID space, UUID page, String label, List<TocApi.View> children) {
        return new TocApi.View(UUID.randomUUID(), space, null, 0, label, TocApi.Kind.TARGET, page, null, 1, children);
    }

    private static TocApi.View group(UUID space, UUID id, String label, List<TocApi.View> children) {
        return new TocApi.View(id, space, null, 0, label, TocApi.Kind.GROUP, null, null, 1, children);
    }
}
