package io.space.control.compositions.releases.release;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ReleaseDecisionsTest {
    @Test
    void skipsEmptyFirstLiveAndUnchangedLive() {
        assertThat(ReleaseDecisions.skip(false, 0, true, true)).isTrue();
        assertThat(ReleaseDecisions.skip(false, 0, false, false)).isTrue();
        assertThat(ReleaseDecisions.skip(false, 1, true, true)).isFalse();
        assertThat(ReleaseDecisions.skip(true, 0, true, true)).isTrue();
        assertThat(ReleaseDecisions.skip(true, 1, true, true)).isTrue();
        assertThat(ReleaseDecisions.skip(true, 0, false, true)).isFalse();
        assertThat(ReleaseDecisions.skip(true, 1, false, false)).isFalse();
    }

    @Test
    void tocOnlyChangeDoesNotSkipExistingLive() {
        assertThat(ReleaseDecisions.skip(true, 1, true, false)).isFalse();
        assertThat(ReleaseDecisions.skip(true, 0, true, false)).isFalse();
    }
}
