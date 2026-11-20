package io.space.concepts.redirect;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.redirect.api.*;
import org.junit.jupiter.api.Test;

class RedirectPathTest {
    @Test
    void normalizesTrailingSlashAndMatchesPrefixWithRemainder() {
        assertThat(new RedirectPath("/old/").value()).isEqualTo("/old");
        var path = new RedirectPath("/docs/old/*");
        assertThat(path.matches("/docs/old")).isTrue();
        assertThat(path.matches("/docs/old/image.png")).isTrue();
        assertThat(path.matches("/docs/older")).isFalse();
        assertThat(RedirectPath.remainder(path.value(), "/docs/old/image.png")).isEqualTo("/image.png");
    }

    @Test
    void rejectsRootQueriesWhitespaceAndMalformedPrefixes() {
        assertThatExceptionOfType(RedirectPath.Invalid.class).isThrownBy(() -> new RedirectPath("/"));
        assertThatExceptionOfType(RedirectPath.Invalid.class).isThrownBy(() -> new RedirectPath("/a?q=x"));
        assertThatExceptionOfType(RedirectPath.Invalid.class).isThrownBy(() -> new RedirectPath("/a b"));
        assertThatExceptionOfType(RedirectPath.Invalid.class).isThrownBy(() -> new RedirectPath("/a//*"));
    }
}
