package io.space.control.entry.http.release;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.control.compositions.releases.bundleimport.BundleImportTypes;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ImportJobCompletionTest {
    @Test
    void onlyPromotedAndSkippedCompletedJobsSatisfyTheImportGoal() {
        for (String outcome : List.of("promoted", "skipped", "held", "flagged", "invalid_bundle")) {
            var result = response("completed", outcome);
            assertThat(result.terminal()).isTrue();
            assertThat(result.successful()).isEqualTo(outcome.equals("promoted") || outcome.equals("skipped"));
            assertThat(result.nextPollAfterSeconds()).isNull();
        }
    }

    @Test
    void dependencyAndResourceFailuresAreTerminalWithoutSuccessWhileRetryingKeepsPolling() {
        for (String outcome :
                List.of("dependency_failed", "unexpected_error", "resource_unavailable", "resource_deleted")) {
            var result = response("failed", outcome);
            assertThat(result.terminal()).isTrue();
            assertThat(result.successful()).isFalse();
        }
        var pending = response("retrying", null);
        assertThat(pending.terminal()).isFalse();
        assertThat(pending.successful()).isFalse();
        assertThat(pending.nextPollAfterSeconds()).isPositive();
    }

    @Test
    void inconsistentWorkerFactsCannotBePublishedAsSuccess() {
        assertThatThrownBy(() -> response("completed", "dependency_failed")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> response("running", "promoted")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> response("failed", "promoted")).isInstanceOf(IllegalStateException.class);
    }

    private static ImportContract.JobResponse response(String status, String outcome) {
        return ImportContract.JobResponse.from(new BundleImportTypes.JobView(
                UUID.randomUUID(),
                status,
                "validating",
                null,
                null,
                1,
                null,
                "trace",
                outcome,
                UUID.randomUUID(),
                null,
                null,
                new BundleImportTypes.ImportReport(List.of(), List.of())));
    }
}
