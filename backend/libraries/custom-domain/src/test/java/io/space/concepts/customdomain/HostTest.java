package io.space.concepts.customdomain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.customdomain.api.*;
import org.junit.jupiter.api.Test;

class HostTest {
    @Test
    void lowercasesAndStripsAndStoresPunycode() {
        assertThat(new Host(" Docs.Acme.TEST ").value()).isEqualTo("docs.acme.test");
        assertThat(new Host("münchen.acme.test").value()).isEqualTo("xn--mnchen-3ya.acme.test");
    }

    @Test
    void rejectsPortsWildcardsTrailingDotsAndSingleLabels() {
        assertThatExceptionOfType(Host.Invalid.class).isThrownBy(() -> new Host("docs.acme.test:443"));
        assertThatExceptionOfType(Host.Invalid.class).isThrownBy(() -> new Host("*.acme.test"));
        assertThatExceptionOfType(Host.Invalid.class).isThrownBy(() -> new Host("docs.acme.test."));
        assertThatExceptionOfType(Host.Invalid.class).isThrownBy(() -> new Host("localhost"));
        assertThatExceptionOfType(Host.Invalid.class).isThrownBy(() -> new Host("https://docs.acme.test"));
    }
}
