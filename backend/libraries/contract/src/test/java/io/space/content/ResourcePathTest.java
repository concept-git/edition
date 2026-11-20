package io.space.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import org.junit.jupiter.api.Test;

class ResourcePathTest {
    @Test
    void keepsSkillNamesExtensionsCaseAndRelativeReferenceDirectories() {
        assertThat(new ResourcePath("skills/doc-quality/SKILL.md").value()).isEqualTo("skills/doc-quality/SKILL.md");
        assertThat(new ResourcePath("说明/参考 文档.md").value()).isEqualTo("说明/参考 文档.md");
    }

    @Test
    void refusesAmbiguousOrEscapingPaths() {
        for (String value :
                new String[] {"", "/root", "a/", "a//b", "a/../b", "a/./b", "a\\b", "a\n.md", "x".repeat(256)}) {
            assertThatIllegalArgumentException().isThrownBy(() -> new ResourcePath(value));
        }
    }

    @Test
    void identifiesNamespaceConflictsWithoutConfusingSiblingPrefixes() {
        var file = new ResourcePath("skills/quality");
        assertThat(file.conflictsWith(new ResourcePath("skills/quality/SKILL.md")))
                .isTrue();
        assertThat(file.conflictsWith(new ResourcePath("skills/quality"))).isTrue();
        assertThat(file.conflictsWith(new ResourcePath("skills/quality-extra/SKILL.md")))
                .isFalse();
    }
}
