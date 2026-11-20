package io.space.control.entry.http.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class AuthenticationRateLimiterTest {
    @Test
    void ipLimitAppliesAcrossDifferentTokens() {
        var limiter = limiter(Clock.systemUTC(), 2, 10);
        limiter.preview("192.0.2.1", "first");
        limiter.preview("192.0.2.1", "second");
        assertThatThrownBy(() -> limiter.preview("192.0.2.1", "third")).isInstanceOf(RateLimitedException.class);
        limiter.preview("192.0.2.2", "third");
    }

    @Test
    void tokenLimitAppliesAcrossDifferentIpsAndResetsAtTheBoundary() {
        var clock = new MutableClock();
        var limiter = limiter(clock, 10, 2);
        limiter.preview("192.0.2.1", "same-token");
        limiter.preview("192.0.2.2", "same-token");
        clock.now = clock.now.plusSeconds(59);
        try {
            limiter.preview("192.0.2.3", "same-token");
            throw new AssertionError("Expected rate limit");
        } catch (RateLimitedException rejected) {
            assertThat(rejected.retryAfter()).isEqualTo(1);
        }
        clock.now = clock.now.plusSeconds(1);
        limiter.preview("192.0.2.3", "same-token");
    }

    @Test
    void concurrentRequestsCannotOverspendTheTokenBucket() throws Exception {
        var limiter = limiter(Clock.systemUTC(), 100, 7);
        var accepted = new AtomicInteger();
        try (var executor = Executors.newFixedThreadPool(12)) {
            var futures = IntStream.range(0, 40)
                    .mapToObj(i -> executor.submit(() -> {
                        try {
                            limiter.preview("192.0.2." + i, "concurrent-token");
                            accepted.incrementAndGet();
                        } catch (RateLimitedException rejected) {
                            assertThat(rejected.retryAfter()).isBetween(1L, 60L);
                        }
                    }))
                    .toList();
            for (var future : futures) future.get();
        }
        assertThat(accepted).hasValue(7);
    }

    private AuthenticationRateLimiter limiter(Clock clock, int ip, int token) {
        return new AuthenticationRateLimiter(clock, 10, 20, 30, 5, 3, 1000, ip, token);
    }

    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-09-08T00:00:00Z");

        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        public Clock withZone(ZoneId zone) {
            return this;
        }

        public Instant instant() {
            return now;
        }
    }
}
