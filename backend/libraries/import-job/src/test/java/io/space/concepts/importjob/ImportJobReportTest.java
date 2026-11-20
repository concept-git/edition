package io.space.concepts.importjob;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importjob.api.*;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class ImportJobReportTest {
    @Test
    void boundsPersistedDiagnosticsAndSignalsTruncation() {
        var errors = IntStream.range(0, 200)
                .mapToObj(i -> new ImportJobApi.Issue("invalid_manifest", "CLASS[" + i + "]", "x".repeat(2000)))
                .toList();
        var report = new ImportJobApi.Report(errors, List.of());
        assertThat(report.errors()).hasSize(100);
        assertThat(report.errors().getFirst().detail()).hasSize(1000);
        assertThat(report.errors().getLast().code()).isEqualTo("issues_truncated");
    }
}
