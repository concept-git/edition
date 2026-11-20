package io.space.control.compositions.authoring.space;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.space.api.SpaceApi;
import java.util.Locale;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.ResourceLock;

@ResourceLock("java.util.Locale.default")
class SpacePatchLocaleTest {
    @Test
    void activeStatusRemainsValidOnATurkishHost() {
        Locale previous = Locale.getDefault();
        try {
            Locale.setDefault(Locale.forLanguageTag("tr-TR"));
            assertThat(SpacePatch.optionalStatus("active")).isEqualTo(SpaceApi.Status.ACTIVE);
        } finally {
            Locale.setDefault(previous);
        }
    }
}
