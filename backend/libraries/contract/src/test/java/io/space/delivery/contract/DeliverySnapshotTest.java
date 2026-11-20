package io.space.delivery.contract;

import static org.assertj.core.api.Assertions.*;

import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;

/** Publication and telemetry record invariants. */
class DeliverySnapshotTest {
    private final UUID tenant = UUID.randomUUID();
    private final UUID site = UUID.randomUUID();

    @Test
    void searchSettingsRequireAnOrderingOfTheThreeSearchableFields() {
        assertThat(new SiteSnapshot.SearchSettings(List.of("body", "title", "headings"), 3).fields())
                .containsExactly("body", "title", "headings");
        assertThatIllegalArgumentException().isThrownBy(() -> new SiteSnapshot.SearchSettings(List.of("title"), 0));
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new SiteSnapshot.SearchSettings(List.of("title", "title", "body"), 0));
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new SiteSnapshot.SearchSettings(List.of("title", "headings", "body"), -1));
    }

    private SiteSnapshot.Page page(String content, Long bytes, String digest) {
        return new SiteSnapshot.Page(
                site,
                tenant,
                site,
                "/docs/start",
                "Start",
                "markdown",
                "revision",
                content,
                Map.of(),
                Map.of(),
                List.of(),
                Instant.EPOCH,
                bytes,
                digest,
                null,
                null);
    }

    @Test
    void bodyOmissionIsAllowedButPresentBodiesRequireByteLengthAndDigest() {
        assertThat(page(null, null, null).content()).isNull();
        assertThatIllegalArgumentException().isThrownBy(() -> page("正文", null, "a".repeat(64)));
        assertThatIllegalArgumentException().isThrownBy(() -> page("正文", 6L, null));
        assertThat(page("正文", 6L, "a".repeat(64)).contentBytes()).isEqualTo(6L);
        var derived = new SiteSnapshot.Page(
                site,
                tenant,
                site,
                "/docs/start",
                "Start",
                "markdown",
                "revision",
                "正文",
                Map.of(),
                Map.of(),
                List.of(),
                Instant.EPOCH);
        assertThat(derived.contentBytes()).isEqualTo(6L);
        assertThat(derived.contentSha256()).matches("[0-9a-f]{64}");
        var absent = new SiteSnapshot.Page(
                site,
                tenant,
                site,
                "/docs/start",
                "Start",
                "markdown",
                "revision",
                null,
                Map.of(),
                Map.of(),
                List.of(),
                Instant.EPOCH);
        assertThat(absent.contentBytes()).isNull();
        assertThat(absent.contentSha256()).isNull();
    }

    @Test
    void telemetryDropsSensitiveIdentityAndLimitsOnlyItsPublicPath() {
        var event = new TelemetryEvent(
                site,
                site,
                Instant.EPOCH,
                tenant,
                site,
                null,
                "search",
                "/" + "a".repeat(600) + "?token=secret",
                " ＤＯＣＳ   Search ",
                null,
                "bad visitor",
                "https://secret.example/path",
                false,
                true,
                0);
        assertThat(event.path()).hasSize(512).doesNotContain("?");
        assertThat(event.query()).isEqualTo("docs search");
        assertThat(event.visitor()).isNull();
        assertThat(event.referrer()).isNull();
        assertThat(TelemetryEvent.sanitizeQuery(null)).isNull();
        for (String secret : List.of(
                "me@example.com",
                "password:secret",
                "secret=value",
                "token=value",
                "authorization=value",
                "13812345678",
                "a".repeat(40)))
            assertThat(TelemetryEvent.sanitizeQuery(secret)).isNull();
        var visible = new TelemetryEvent(
                site,
                site,
                Instant.EPOCH,
                tenant,
                site,
                null,
                "visit",
                null,
                null,
                null,
                "a".repeat(32),
                "docs.example",
                false,
                true,
                0);
        assertThat(visible.path()).isNull();
        assertThat(visible.visitor()).isEqualTo("a".repeat(32));
        assertThat(visible.referrer()).isEqualTo("docs.example");
    }
}
