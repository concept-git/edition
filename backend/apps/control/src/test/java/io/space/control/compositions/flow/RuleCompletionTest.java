package io.space.control.compositions.flow;

import static org.assertj.core.api.Assertions.*;

import io.space.control.compositions.RequestAuditContext;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;

class RuleCompletionTest {
    @Test
    void equalValuedInvocationsHaveDistinctOccurrencesAndRetainTheSameEntryFlow() {
        try (var scope = RequestAuditContext.entry()) {
            var one = RuleCompletion.<String>create();
            var two = RuleCompletion.<String>create();
            assertThat(one.flowId()).isEqualTo(two.flowId());
            assertThat(one.occurrenceId()).isNotEqualTo(two.occurrenceId());
            assertThat(one.claim("sameRule")).isTrue();
            assertThat(two.claim("sameRule")).isTrue();
            one.complete("same");
            two.complete("same");
            assertThat(one.result()).isEqualTo(two.result());
        }
    }

    @Test
    void concurrentDuplicateEvaluationClaimsTheRuleExactlyOnce() {
        var completion = RuleCompletion.<Integer>create();
        var effects = new AtomicInteger();
        IntStream.range(0, 100).parallel().forEach(i -> {
            if (completion.claim("effect")) {
                effects.incrementAndGet();
                completion.complete(42);
            }
        });
        assertThat(effects).hasValue(1);
        assertThat(completion.result()).isEqualTo(42);
        assertThatThrownBy(() -> completion.complete(43)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void anAbsentHandlerFailsExplicitlyAndCannotBorrowAnotherInvocationsResult() {
        var one = RuleCompletion.<String>create();
        var two = RuleCompletion.<String>create();
        one.complete("first");
        assertThatThrownBy(() -> two.dispatch(event -> {}, "unhandled"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No synchronization");
        assertThat(one.result()).isEqualTo("first");
    }

    @Test
    void classifiedFailureIsRetainedWithoutErasingAnEarlierCompletion() {
        var failed = RuleCompletion.<String>create();
        var rejection = new DataAccessResourceFailureException("unavailable");
        assertThatThrownBy(() -> failed.dispatch(
                        event -> {
                            throw rejection;
                        },
                        "effect"))
                .isSameAs(rejection);
        assertThatThrownBy(failed::result).isSameAs(rejection);
        var completed = RuleCompletion.<String>create();
        completed.complete("committed");
        assertThatThrownBy(() -> completed.dispatch(
                        event -> {
                            throw rejection;
                        },
                        "later"))
                .isSameAs(rejection);
        assertThat(completed.result()).isEqualTo("committed");
    }

    @Test
    void voidCompletionsHaveAnExplicitSuccessfulOutcome() {
        var completion = RuleCompletion.<Void>create();
        assertThat(completion.dispatch(event -> completion.complete(null), "void-effect"))
                .isNull();
    }
}
