package io.space.contentapp;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.delivery.contract.TelemetryEvent;
import io.space.contentapp.entry.observability.ContentAnalytics;
import org.junit.jupiter.api.Test;

class TelemetrySanitizationTest {
    @Test
    void normalizationCannotBypassSensitiveQueryFiltering() {
        for (String query :
                new String[] {"admin@example.com", "ａｄｍｉｎ＠ｅｘａｍｐｌｅ．ｃｏｍ", "ｔｏｋｅｎ＝secret", "token=secret", "13800138000"
                }) {
            assertThat(TelemetryEvent.sanitizeQuery(query)).isNull();
            assertThat(ContentAnalytics.safeQuery(query)).isNull();
        }
        assertThat(ContentAnalytics.safeQuery("  API   Token  ")).isEqualTo("api token");
    }
}
