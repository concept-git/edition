package io.space.control.compositions.authoring.pageediting;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PageTitleSlugQueryTest {
    @Test
    void ignoresBlankQueriesAndALeadingSlash() {
        assertThat(PageTitleSlugQuery.needle(null)).isNull();
        assertThat(PageTitleSlugQuery.needle("  ")).isNull();
        assertThat(PageTitleSlugQuery.needle("/")).isNull();
        assertThat(PageTitleSlugQuery.needle("/shaanxi")).isEqualTo("shaanxi");
        assertThat(PageTitleSlugQuery.needle("  陕西  ")).isEqualTo("陕西");
    }

    @Test
    void matchesTitleOrSlugIgnoringCase() {
        assertThat(PageTitleSlugQuery.matches("Guide", "intro", "GUIDE")).isTrue();
        assertThat(PageTitleSlugQuery.matches("陕西考古博物馆", "shaanxi-archaeology-museum", "archae"))
                .isTrue();
        assertThat(PageTitleSlugQuery.matches("Guide", "guide", "missing")).isFalse();
        assertThat(PageTitleSlugQuery.matches((String) null, "guide", "guide")).isFalse();
        assertThat(PageTitleSlugQuery.matches("Guide", null, "guide")).isFalse();
    }
}
