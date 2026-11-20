package io.space.control.compositions.platform.pluginmanagement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import io.space.concepts.contenttype.api.ContentTypeApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.content.ContentProfile;
import io.space.content.ContentTypeDefinition;
import io.space.content.ContentTypeSnapshot;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class PluginFixtureChecksTest {
    private final JsonMapper json = JsonMapper.builder().build();

    @Test
    void oneFixtureKeepsItsDefinitionWhenTheDefaultChangesBetweenViews() {
        var first = snapshot("first");
        var second = snapshot("second");
        var active = new AtomicReference<>(first);
        var catalog = mock(ContentTypeApi.class);
        var releases = mock(ReleaseApi.class);
        when(catalog.state("custom")).thenAnswer(call -> {
            var current = active.get();
            return java.util.Optional.of(new ContentTypeApi.State(
                    "custom", true, 1, current.versionRef(), "Custom", "json", "application/json", false));
        });
        when(catalog.resolve(eq("custom"), anyString(), eq(false)))
                .thenAnswer(call -> call.getArgument(1).equals("first") ? first : second);
        var versions = new ArrayList<String>();
        var configurations = new ArrayList<Object>();
        when(releases.inspectContent(
                        anyString(), anyString(), any(ContentProfile.class), any(ContentTypeDefinition.class)))
                .thenAnswer(call -> {
                    versions.add(((ContentTypeDefinition) call.getArgument(3)).version());
                    configurations.add(((ContentProfile) call.getArgument(2))
                            .interpretation()
                            .get("view"));
                    // Model a concurrent activation immediately after the first view is validated.
                    active.set(second);
                    return List.of();
                });
        var checks = PluginFixtureChecks.inspect(
                json.readTree("""
                        {"editors":[{"id":"source","contentTypes":["custom"],"config":{"view":"editor"}}],
                         "renderers":[{"id":"preview","contentTypes":["custom"],"config":{"view":"renderer"}}]}
                        """), json.readTree("{}"), json.readTree("""
                        [{"id":"sample","label":"Sample","contentType":"custom","value":"{}"}]
                        """), catalog, releases, json);
        assertThat(versions).containsExactly("first", "first");
        assertThat(configurations).containsExactly("editor", "renderer");
        assertThat(checks)
                .filteredOn(check -> check.name().startsWith("content:"))
                .hasSize(2)
                .allSatisfy(check -> {
                    assertThat(check.passed()).isTrue();
                    assertThat(check.message()).contains("versionRef=first", "digest=digest-first");
                });
        verify(catalog).state("custom");
        verify(catalog).resolve("custom", "first", false);
        verifyNoMoreInteractions(catalog);
    }

    private ContentTypeSnapshot snapshot(String version) {
        return new ContentTypeSnapshot(
                version,
                "digest-" + version,
                new ContentTypeDefinition(
                        "custom",
                        version,
                        "Custom",
                        "json",
                        "application/json",
                        "json",
                        "browser",
                        Map.of(),
                        null,
                        Map.of(),
                        List.of(),
                        List.of()));
    }

    @Test
    void anUnavailableVersionProducesExplicitFailuresForEveryViewWithoutValidation() {
        var catalog = mock(ContentTypeApi.class);
        var releases = mock(ReleaseApi.class);
        when(catalog.resolve("custom", "missing", false)).thenThrow(new ContentTypeApi.Missing());
        var checks = PluginFixtureChecks.inspect(
                json.readTree("""
                        {"editors":[{"id":"source","contentTypes":["custom"]}],
                         "renderers":[{"id":"preview","contentTypes":["custom"]}]}
                        """), json.readTree("{}"), json.readTree("""
                        [{"id":"sample","label":"Sample","contentType":"custom","value":"{}","versionRef":"missing"}]
                        """), catalog, releases, json);
        assertThat(checks)
                .filteredOn(check -> check.name().startsWith("content:"))
                .extracting(check -> check.name())
                .containsExactly("content:sample:source", "content:sample:preview");
        assertThat(checks)
                .filteredOn(check -> check.name().startsWith("content:"))
                .allSatisfy(check -> {
                    assertThat(check.passed()).isFalse();
                    assertThat(check.message())
                            .contains("unavailable", "requestedVersionRef=missing")
                            .doesNotContain("digest=");
                });
        verify(catalog).resolve("custom", "missing", false);
        verifyNoMoreInteractions(catalog);
        verifyNoInteractions(releases);
    }
}
