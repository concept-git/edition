package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.config.MeterFilter;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.ConfigurationPropertySources;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.boot.micrometer.metrics.autoconfigure.MetricsProperties;
import org.springframework.core.io.ClassPathResource;
import tools.jackson.databind.json.JsonMapper;

/** Every declared route must fit in the bounded HTTP metrics URI budget. */
class HttpMetricsBudgetTest {
    @Test
    void everyDeclaredRouteRetainsItsHttpMetrics() throws Exception {
        var sources = new YamlPropertySourceLoader().load("application", new ClassPathResource("application.yml"));
        var properties = new Binder(ConfigurationPropertySources.from(sources))
                .bind("management.metrics", Bindable.of(MetricsProperties.class))
                .orElseGet(MetricsProperties::new);
        var paths = new JsonMapper()
                .readTree(SourceLayout.REPOSITORY
                        .resolve("contracts/openapi.json")
                        .toFile())
                .get("paths");
        var registry = new SimpleMeterRegistry();
        try {
            registry.config()
                    .meterFilter(MeterFilter.maximumAllowableTags(
                            "http.server.requests",
                            "uri",
                            properties.getWeb().getServer().getMaxUriTags(),
                            MeterFilter.deny()));
            for (String path : paths.propertyNames()) {
                Timer.builder("http.server.requests").tag("uri", path).register(registry);
            }
            assertThat(registry.get("http.server.requests").timers())
                    .as("所有管理端点必须保留指标，不能因 URI 标签预算不足而被丢弃")
                    .hasSize(paths.size());
        } finally {
            registry.close();
        }
    }
}
