package io.edition.control.compositions.platform.servicehealth;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

/** Probe processes that must never receive management database credentials. */
@Component
class RemoteHealthProbes {
    private final String readerUrl;
    private final okhttp3.OkHttpClient client;
    private final JsonMapper json;

    RemoteHealthProbes(@Value("${io.edition.health.reader-url:}") String readerUrl, JsonMapper json) {
        this.readerUrl = trim(readerUrl);
        this.json = json;
        this.client = new okhttp3.OkHttpClient.Builder()
                .callTimeout(Duration.ofSeconds(2))
                .connectTimeout(Duration.ofSeconds(2))
                .readTimeout(Duration.ofSeconds(2))
                .build();
    }

    ServiceStatuses.HealthService reader(Instant now) {
        return probe("edition-content", readerUrl, "READER_HEALTH_URL", now);
    }

    private ServiceStatuses.HealthService probe(String service, String baseUrl, String setting, Instant now) {
        if (baseUrl.isEmpty()) {
            return new ServiceStatuses.HealthService(
                    service, "unconfigured", List.of(), Map.of("hint", "设置 " + setting + " 后可探测服务"));
        }
        try (var response = client.newCall(
                        new okhttp3.Request.Builder().url(baseUrl + "/healthz").build())
                .execute()) {
            var body = response.body();
            var up = response.isSuccessful()
                    && body != null
                    && "UP".equals(json.readTree(body.string()).path("status").asString());
            return new ServiceStatuses.HealthService(
                    service,
                    up ? "normal" : "lost",
                    List.of(new ServiceStatuses.HealthInstance(baseUrl, null, now, up ? "normal" : "lost", Map.of())),
                    Map.of("probe", baseUrl + "/healthz"));
        } catch (JacksonException invalidResponse) {
            return lost(service, baseUrl, "invalid_response");
        } catch (java.io.IOException unreachable) {
            return lost(service, baseUrl, "probe_failed");
        }
    }

    private static ServiceStatuses.HealthService lost(String service, String baseUrl, String error) {
        return new ServiceStatuses.HealthService(
                service, "lost", List.of(), Map.of("probe", baseUrl + "/healthz", "error", error));
    }

    private static String trim(String url) {
        return url == null ? "" : url.trim().replaceAll("/+$", "");
    }
}
