package io.space.shared;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class PageWindowTest {
    @Test
    void noContinuationForEmptyShortOrExactlyFullPage() {
        for (var rows : List.of(List.<Integer>of(), List.of(1), List.of(1, 2))) {
            var window = PageWindow.of(rows, 2, row -> {
                throw new AssertionError("没有续页时不得编码游标");
            });
            assertThat(window.items()).isEqualTo(rows);
            assertThat(window.nextCursor()).isNull();
        }
    }

    @Test
    void continuationUsesLastReturnedRowAndNeverExposesSentinel() {
        var last = UUID.randomUUID();
        var sentinel = UUID.randomUUID();
        var window = PageWindow.of(List.of(last, sentinel), 1, id -> id);
        assertThat(window.items()).containsExactly(last);
        assertThat(window.nextCursor()).isEqualTo(last);
    }

    @Test
    void pageDoesNotShareMutableStorageWithQueryResults() {
        var rows = new ArrayList<>(List.of(1, 2, 3));
        var window = PageWindow.of(rows, 2, Object::toString);
        rows.clear();
        assertThat(window.items()).containsExactly(1, 2);
        assertThatThrownBy(() -> window.items().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> PageWindow.of(List.of(1), 0, Object::toString))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
