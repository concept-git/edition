package io.space.control.compositions.hosting.sitedelivery;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;

class ReaderAddressTest {
    @Test
    void usesDeploymentSchemeAndPortAndEncodesPaths() {
        var local = new ReaderAddress("http", 8095);
        assertThat(local.href("docs.localhost", "docs/api guide"))
                .isEqualTo("http://docs.localhost:8095/docs/api%20guide");
        assertThat(new ReaderAddress("https", -1).href("docs.example.test", null))
                .isEqualTo("https://docs.example.test/");
        assertThat(local.href(null, "docs")).isNull();
        assertThatIllegalArgumentException().isThrownBy(() -> new ReaderAddress("javascript", -1));
        assertThatIllegalArgumentException().isThrownBy(() -> new ReaderAddress("https", 65536));
    }
}
