package io.space.control.compositions.releases.bundleimport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;

class ImportZipFileTest {
    @Test
    void copiedArchiveClosesItsSourceAndDeletesItsFileWhenReleased() throws Exception {
        var closed = new AtomicBoolean();
        var source = new ByteArrayInputStream(new byte[] {'P', 'K', 1, 2}) {
            @Override
            public void close() {
                closed.set(true);
            }
        };
        var zip = ImportZipFile.copy(source);
        try (zip) {
            assertThat(closed).isTrue();
            assertThat(Files.readAllBytes(zip.path())).containsExactly('P', 'K', 1, 2);
        }
        assertThat(zip.path()).doesNotExist();
    }

    @Test
    void copyFailureClosesTheSourceAndPreservesTheOriginalFailure() {
        var failure = new IOException("interrupted download");
        var closed = new AtomicBoolean();
        var source = new InputStream() {
            @Override
            public int read() throws IOException {
                throw failure;
            }

            @Override
            public void close() throws IOException {
                closed.set(true);
                throw new IOException("close also failed");
            }
        };
        assertThatThrownBy(() -> ImportZipFile.copy(source))
                .isSameAs(failure)
                .satisfies(error -> assertThat(error.getSuppressed()).hasSize(1));
        assertThat(closed).isTrue();
    }
}
