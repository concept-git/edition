package io.space.content;

import static org.assertj.core.api.Assertions.*;

import java.util.*;
import org.junit.jupiter.api.Test;

/** The passive catalog must reject broken registrations before any plugin code can run. */
class ContentDescriptorTest {
    private static ContentPluginDescriptors.View view(String id, List<String> types) {
        return new ContentPluginDescriptors.View(id, "Markdown", "space-markdown", types, null);
    }

    private static ContentPluginDescriptors.Manifest manifest(
            List<String> types,
            List<ContentPluginDescriptors.View> editors,
            List<ContentPluginDescriptors.View> renderers) {
        return new ContentPluginDescriptors.Manifest(
                "markdown-plugin", "Markdown", "1", 1, types, editors, renderers, "Text");
    }

    private static ContentPluginDescriptors.Type type(
            String id, String version, String label, String format, String media, String language, String host) {
        return new ContentPluginDescriptors.Type(
                id, version, label, format, media, language, host, null, null, null, null, null);
    }

    private static ContentPluginDescriptors.Type markdown() {
        return type("markdown", "1", "Markdown", "markdown", "text/markdown", "markdown", "server");
    }

    @Test
    void catalogRequiresUniqueRegisteredTypesAndAnActualRendererForEach() {
        var renderer = view("render", List.of("markdown"));
        var plugin = new ContentPluginDescriptors.Plugin(
                manifest(List.of("markdown"), List.of(), List.of(renderer)), null, "render.js");
        var types = new ArrayList<>(List.of(markdown()));
        var plugins = new ArrayList<>(List.of(plugin));
        var catalog = new ContentPluginDescriptors(1, types, plugins);
        types.clear();
        plugins.clear();
        assertThat(catalog.types()).hasSize(1);
        assertThat(catalog.plugins()).containsExactly(plugin);
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new ContentPluginDescriptors(2, catalog.types(), catalog.plugins()));
        for (List<ContentPluginDescriptors.Type> invalid :
                Arrays.asList(null, List.<ContentPluginDescriptors.Type>of(), List.of(markdown(), markdown())))
            assertThatIllegalArgumentException()
                    .isThrownBy(() -> new ContentPluginDescriptors(1, invalid, catalog.plugins()));
        for (List<ContentPluginDescriptors.Plugin> invalid :
                Arrays.asList(null, List.<ContentPluginDescriptors.Plugin>of(), List.of(plugin, plugin)))
            assertThatIllegalArgumentException()
                    .isThrownBy(() -> new ContentPluginDescriptors(1, catalog.types(), invalid));
        var unknown = new ContentPluginDescriptors.Plugin(
                manifest(List.of("json"), List.of(), List.of(view("render", List.of("json")))), null, "render.js");
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new ContentPluginDescriptors(1, catalog.types(), List.of(unknown)));
        var editorOnly = new ContentPluginDescriptors.Plugin(
                manifest(List.of("markdown"), List.of(renderer), List.of()), "edit.js", null);
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new ContentPluginDescriptors(1, catalog.types(), List.of(editorOnly)));
    }

    @Test
    void descriptorRejectsIncompleteIdentitiesFormatsAndRenderHosts() {
        // Each row changes one required field. This makes every rejection's reason visible.
        String[] valid = {"markdown", "1", "Markdown", "markdown", "text/markdown", "markdown", "server"};
        for (int field : new int[] {0, 1, 2, 4, 5, 6}) {
            for (String value : Arrays.asList(null, "")) {
                String[] invalid = valid.clone();
                invalid[field] = value;
                assertThatIllegalArgumentException()
                        .isThrownBy(() -> type(
                                invalid[0], invalid[1], invalid[2], invalid[3], invalid[4], invalid[5], invalid[6]));
            }
        }
        assertThatIllegalArgumentException()
                .isThrownBy(() -> type("Not Valid", "1", "Text", "markdown", "text/markdown", "markdown", "server"));
        assertThatIllegalArgumentException()
                .isThrownBy(() -> type("markdown", "1", "Text", "pdf", "text/markdown", "markdown", "server"));
        assertThatIllegalArgumentException()
                .isThrownBy(() -> type("markdown", "1", "Text", "markdown", "text/markdown", "markdown", "remote"));
        var browser = type("markdown", "1", "Text", "markdown", "text/markdown", "markdown", "browser");
        assertThat(browser.renderHost()).isEqualTo("browser");
        assertThat(browser.schemaResources()).isEmpty();
        assertThat(browser.editors()).isEmpty();
        assertThat(browser.renderers()).isEmpty();
        var schemas = new HashMap<>(Map.of("root", "{}"));
        var definition = browser.definition(schemas);
        schemas.clear();
        assertThat(definition.schemaResources()).containsEntry("root", "{}");
        assertThatThrownBy(() -> definition.schemaResources().clear())
                .isInstanceOf(UnsupportedOperationException.class);
        var empty = new ContentTypeDefinition(
                "x", "1", "X", "txt", "text/plain", "text", "server", null, null, null, null, null);
        assertThat(empty.schemaResources()).isEmpty();
        assertThat(empty.editors()).isEmpty();
        assertThat(empty.renderers()).isEmpty();
    }

    @Test
    void contributionsRequireValidCustomElementsDeclaredTypesAndTheirEntryPoints() {
        for (String invalid : Arrays.asList(null, "")) {
            assertThatIllegalArgumentException()
                    .isThrownBy(() -> new ContentPluginDescriptors.View(
                            invalid, "Text", "space-text", List.of("markdown"), null));
            assertThatIllegalArgumentException()
                    .isThrownBy(() -> new ContentPluginDescriptors.View(
                            "edit", invalid, "space-text", List.of("markdown"), null));
            assertThatIllegalArgumentException()
                    .isThrownBy(() ->
                            new ContentPluginDescriptors.View("edit", "Text", invalid, List.of("markdown"), null));
        }
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new ContentPluginDescriptors.View("edit", "Text", "div", List.of("markdown"), null));
        for (List<String> invalid : Arrays.asList(null, List.<String>of()))
            assertThatIllegalArgumentException().isThrownBy(() -> view("edit", invalid));
        var editor = view("edit", List.of("markdown"));
        assertThat(editor.config()).isEmpty();
        assertThat(new ContentPluginDescriptors.View(
                                "edit", "Text", "space-text", List.of("markdown"), Map.of("theme", "light"))
                        .config())
                .containsEntry("theme", "light");
        var both = manifest(List.of("markdown"), List.of(editor), List.of(view("render", List.of("markdown"))));
        for (String invalid : Arrays.asList(null, " ")) {
            assertThatIllegalArgumentException()
                    .isThrownBy(() -> new ContentPluginDescriptors.Plugin(both, invalid, "render.js"));
            assertThatIllegalArgumentException()
                    .isThrownBy(() -> new ContentPluginDescriptors.Plugin(both, "edit.js", invalid));
        }
        assertThatIllegalArgumentException().isThrownBy(() -> new ContentPluginDescriptors.Plugin(null, null, null));
        assertThat(new ContentPluginDescriptors.Plugin(both, "edit.js", "render.js").manifest())
                .isEqualTo(both);
        assertThatIllegalArgumentException()
                .isThrownBy(() -> manifest(List.of("markdown", "markdown"), List.of(), List.of()));
        assertThatIllegalArgumentException()
                .isThrownBy(() -> manifest(List.of("markdown"), List.of(editor, editor), List.of()));
        assertThatIllegalArgumentException()
                .isThrownBy(() -> manifest(List.of("markdown"), List.of(view("edit", List.of("json"))), List.of()));
    }

    @Test
    void manifestsRejectMissingMetadataBeforeResolvingContributions() {
        String[] valid = {"plugin", "Plugin", "1"};
        for (int field = 0; field < valid.length; field++) {
            for (String value : Arrays.asList(null, " ")) {
                String[] invalid = valid.clone();
                invalid[field] = value;
                assertThatIllegalArgumentException()
                        .isThrownBy(() -> new ContentPluginDescriptors.Manifest(
                                invalid[0],
                                invalid[1],
                                invalid[2],
                                1,
                                List.of("markdown"),
                                List.of(),
                                List.of(),
                                null));
            }
        }
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new ContentPluginDescriptors.Manifest(
                        "plugin", "Plugin", "1", 2, List.of("markdown"), List.of(), List.of(), null));
        for (List<String> types : Arrays.asList(null, List.<String>of()))
            assertThatIllegalArgumentException().isThrownBy(() -> manifest(types, List.of(), List.of()));
        assertThatIllegalArgumentException().isThrownBy(() -> manifest(List.of("markdown"), null, List.of()));
        assertThatIllegalArgumentException().isThrownBy(() -> manifest(List.of("markdown"), List.of(), null));
    }

    @Test
    void profileRetainsVersionBindingAndBoundsInterpretationSize() {
        for (String invalid : Arrays.asList(null, " ", "x".repeat(129)))
            assertThatIllegalArgumentException().isThrownBy(() -> new ContentProfile(invalid, null, Map.of()));
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new ContentProfile("markdown", "x".repeat(257), Map.of()));
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new ContentProfile("markdown", null, Map.of("value", "x".repeat(262144))));
        assertThat(ContentProfile.of("HTML", null, null)).isEqualTo(ContentProfile.defaults("HTML"));
        assertThat(ContentProfile.of("HTML", "custom", null).contentType()).isEqualTo("custom");
        var values = new LinkedHashMap<String, Object>();
        values.put("contentType", "markdown");
        values.put("versionRef", "v1");
        values.put("ignored", null);
        values.put("schema", "root");
        var profile = ContentProfile.read(values);
        assertThat(profile.interpretation()).containsOnlyKeys("schema");
        assertThat(profile.bind("v2").versionRef()).isEqualTo("v2");
        assertThat(ContentProfile.read(Map.of("contentType", "markdown", "interpretation", Map.of("schema", "root")))
                        .interpretation())
                .isEqualTo(profile.interpretation());
        assertThat(DocumentFormat.fromFileName("unknown.binary")).isEmpty();
    }
}
