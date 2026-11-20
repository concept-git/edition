package io.space.concepts.space.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.space.api.*;
import io.space.content.ResourcePath;
import org.junit.jupiter.api.Test;

class PlacementPathTest {
    @Test
    void preservesCanonicalFileNameCaseAndExtension() {
        assertThat(new ResourcePath("skills/Ｇuide-中文/SKILL.md").value()).isEqualTo("skills/Ｇuide-中文/SKILL.md");
    }

    @Test
    void rejectsAbsoluteDotSegmentsControlsAndOverlongFileNames() {
        assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(() -> new ResourcePath("/guide"));
        assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(() -> new ResourcePath("guide/../start"));
        assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(() -> new ResourcePath("guide\nstart"));
        assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(() -> new ResourcePath("x".repeat(256)));
    }
}
