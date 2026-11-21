package io.edition.control.compositions.platform.pluginmanagement;

import io.edition.concepts.pluginverification.api.PluginVerificationApi.Check;
import java.util.*;
import tools.jackson.databind.JsonNode;

/** Structural SDK input validation. This deliberately does not claim to execute candidate JavaScript. */
final class PluginManifestChecks {
    private PluginManifestChecks() {}

    static List<Check> inspect(JsonNode manifest) {
        var checks = new ArrayList<Check>();
        boolean identity = manifest != null
                && manifest.isObject()
                && nonblankString(manifest.path("id"))
                && nonblankString(manifest.path("name"))
                && nonblankString(manifest.path("version"));
        checks.add(new Check(
                "manifest_identity", identity, "SDK manifest requires nonempty id, name, and version strings."));
        checks.add(new Check(
                "manifest_api",
                manifest != null
                        && manifest.path("apiVersion").isInt()
                        && manifest.path("apiVersion").asInt() == 1,
                "Only SDK apiVersion 1 is supported."));
        var types = new HashSet<String>();
        boolean typeValid = manifest != null
                && manifest.path("contentTypes").isArray()
                && !manifest.path("contentTypes").isEmpty();
        if (typeValid)
            for (var type : manifest.path("contentTypes")) {
                if (!type.isString() || type.asString().isBlank()) typeValid = false;
                else types.add(type.asString());
            }
        checks.add(new Check(
                "manifest_content_types", typeValid, "Content types must be a nonempty list of nonempty strings."));
        boolean viewsValid = manifest != null;
        if (manifest != null)
            for (String family : List.of("editors", "renderers")) {
                var views = manifest.path(family);
                if (!views.isArray() || views.size() > 50) {
                    viewsValid = false;
                    continue;
                }
                var ids = new HashSet<String>();
                for (var view : views) {
                    String id = view.path("id").asString("");
                    if (!view.isObject()
                            || !nonblankString(view.path("id"))
                            || !ids.add(id)
                            || !view.path("label").isString()
                            || view.path("label").asString().isBlank()
                            || !view.path("tagName").asString("").matches("[a-z][a-z0-9]*(?:-[a-z0-9]+)+")
                            || !view.path("contentTypes").isArray()
                            || view.path("contentTypes").isEmpty()) viewsValid = false;
                    for (var type : view.path("contentTypes"))
                        if (!type.isString() || !types.contains(type.asString())) viewsValid = false;
                }
            }
        checks.add(
                new Check(
                        "manifest_views",
                        viewsValid,
                        "Each view family allows at most 50 entries with unique ids, labels, custom-element names and supported content-type subsets."));
        return List.copyOf(checks);
    }

    private static boolean nonblankString(JsonNode value) {
        return value.isString() && !value.asString().isBlank();
    }
}
