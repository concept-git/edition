package io.space.concepts.revision.domain;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.revision.api.*;
import io.space.concepts.revision.api.RevisionApi;
import org.junit.jupiter.api.Test;

class RevisionDiffTest {
    @Test
    void exposesStableLineHunksInsteadOfLibraryTypes() {
        RevisionApi.Diff diff = RevisionDiff.between(1, "alpha\nbeta\n", 2, "alpha\ngamma\n");

        assertThat(diff.from()).isEqualTo(1);
        assertThat(diff.to()).isEqualTo(2);
        assertThat(diff.hunks()).hasSize(1);
        assertThat(diff.hunks().getFirst().lines())
                .extracting(RevisionApi.DiffLine::type, RevisionApi.DiffLine::content)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple(RevisionApi.DiffLineType.DELETE, "beta"),
                        org.assertj.core.groups.Tuple.tuple(RevisionApi.DiffLineType.ADD, "gamma"));
    }

    @Test
    void sameRevisionHasNoHunks() {
        assertThat(RevisionDiff.between(3, "same", 3, "same").hunks()).isEmpty();
    }
}
