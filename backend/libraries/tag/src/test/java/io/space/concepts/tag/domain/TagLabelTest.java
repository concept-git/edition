package io.space.concepts.tag.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.tag.api.*;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** Label 归一化与单页上限：不碰持久化。 */
class TagLabelTest {
    @Test
    void normalizesCaseWhitespaceAndCompatibilityForms() {
        assertThat(new TagLabel("  BeTa  ").value()).isEqualTo("beta");
        assertThat(new TagLabel("A  B").value()).isEqualTo("a b");
        assertThat(new TagLabel("A\u00A0B").value()).isEqualTo("a b");
        assertThat(new TagLabel("Ａ").value()).isEqualTo("a");
        assertThat(new TagLabel("指南").value()).isEqualTo("指南");
    }

    @Test
    void rejectsEmptySlashBackslashControlsAndOverlong() {
        assertThat(new TagLabel("a\nb").value()).isEqualTo("a b");
        assertThatThrownBy(() -> new TagLabel("   ")).isInstanceOf(TagLabel.Invalid.class);
        assertThatThrownBy(() -> new TagLabel("a/b")).isInstanceOf(TagLabel.Invalid.class);
        assertThatThrownBy(() -> new TagLabel("a\\b")).isInstanceOf(TagLabel.Invalid.class);
        assertThatThrownBy(() -> new TagLabel("a\u0001b")).isInstanceOf(TagLabel.Invalid.class);
        assertThatThrownBy(() -> new TagLabel("x".repeat(65))).isInstanceOf(TagLabel.Invalid.class);
        assertThat(new TagLabel("x".repeat(64)).value()).hasSize(64);
    }

    @Test
    void fiftyExistingLabelsBlockANewWordButNotARepeat() {
        Set<String> full = java.util.stream.IntStream.range(0, 50)
                .mapToObj(index -> "t" + index)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        assertThat(TagBook.canAdd(full, "t0")).isEqualTo(TagBook.Outcome.ALREADY);
        assertThat(TagBook.canAdd(full, "fresh")).isEqualTo(TagBook.Outcome.TOO_MANY);
        assertThat(TagBook.canAdd(Set.of("beta"), "ga")).isEqualTo(TagBook.Outcome.ADD);
    }
}
