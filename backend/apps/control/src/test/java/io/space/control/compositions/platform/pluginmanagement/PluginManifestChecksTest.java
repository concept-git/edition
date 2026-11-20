package io.space.control.compositions.platform.pluginmanagement;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class PluginManifestChecksTest {
    private final JsonMapper json = JsonMapper.builder().build();

    @Test
    void rejectsWhitespaceTypeAndViewLabelAsTheBrowserDoes() {
        var manifest = json.readTree("""
                {"id":"example","name":"Example","version":"development","apiVersion":1,
                 "contentTypes":[" "],"editors":[],
                 "renderers":[{"id":"preview","label":" ","tagName":"example-preview","contentTypes":[" "]}]}
                """);
        assertThat(PluginManifestChecks.inspect(manifest))
                .filteredOn(check -> !check.passed())
                .extracting(check -> check.name())
                .containsExactly("manifest_content_types", "manifest_views");
    }
}
