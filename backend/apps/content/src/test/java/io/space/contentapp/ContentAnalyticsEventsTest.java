package io.space.contentapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.space.contentapp.compositions.shared.ContentProblem;
import io.space.contentapp.entry.observability.ContentAnalytics;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import tools.jackson.databind.json.JsonMapper;

class ContentAnalyticsEventsTest {
    private final SimpleMeterRegistry metrics = new SimpleMeterRegistry();
    private ContentAnalytics analytics;

    @BeforeEach
    void setUp() {
        analytics = new ContentAnalytics(
                JsonMapper.builder().build(),
                Base64.getEncoder().encodeToString(new byte[32]),
                Clock.fixed(Instant.parse("2026-11-19T10:00:07Z"), ZoneOffset.UTC),
                metrics,
                Set.of("127.0.0.1"));
        ContentAnalytics.begin();
    }

    @AfterEach
    void tearDown() {
        ContentAnalytics.REQUEST.remove();
        analytics.close();
    }

    private double buffered() {
        return metrics.get("space.analytics.buffer").gauge().value();
    }

    private static MockHttpServletRequest request() {
        var request = new MockHttpServletRequest("POST", "/api/content/events");
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "203.0.113.9");
        request.addHeader("User-Agent", "test");
        return request;
    }

    @Test
    void beaconsAreQueuedOnlyForTracedSites() {
        assertThatThrownBy(() -> analytics.pageViewed(UUID.randomUUID(), "/a", null, request()))
                .isInstanceOfSatisfying(
                        ContentProblem.class,
                        problem -> assertThat(problem.status).isEqualTo(422));
        assertThatThrownBy(() -> analytics.notFound("/a", null, request())).isInstanceOf(ContentProblem.class);
        assertThat(buffered()).isZero();

        ContentAnalytics.site(UUID.randomUUID(), UUID.randomUUID());
        analytics.pageViewed(UUID.randomUUID(), "/a", "https://ref.test/x", request());
        analytics.pageViewed(UUID.randomUUID(), "/a", "not a uri", request());
        analytics.notFound("/gone", null, request());
        assertThat(buffered()).isEqualTo(3);
    }

    @Test
    void finishDoesNotCountTheBeaconRequestItself() {
        ContentAnalytics.site(UUID.randomUUID(), UUID.randomUUID());
        analytics.pageViewed(UUID.randomUUID(), "/a", null, request());

        analytics.finish(request(), 202);

        assertThat(buffered()).isEqualTo(1);
    }

    @Test
    void beaconRateIsLimitedPerHostAndClientWithinAMinute() {
        var request = request();
        for (int i = 0; i < 120; i++) analytics.admit("docs.example.com", request);

        assertThatThrownBy(() -> analytics.admit("docs.example.com", request))
                .isInstanceOfSatisfying(
                        ContentProblem.class,
                        problem -> assertThat(problem.status).isEqualTo(429));
        analytics.admit("other.example.com", request);
    }
}
