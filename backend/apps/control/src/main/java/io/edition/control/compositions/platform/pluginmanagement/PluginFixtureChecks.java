package io.edition.control.compositions.platform.pluginmanagement;

import io.edition.concepts.contenttype.api.ContentTypeApi;
import io.edition.concepts.pluginverification.api.PluginVerificationApi.Check;
import io.edition.concepts.release.api.ReleaseApi;
import io.edition.content.ContentProfile;
import io.edition.content.ContentTypeSnapshot;
import java.util.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

/** Validates the same fixed fixture/configuration inputs as the browser, without executing its code. */
final class PluginFixtureChecks {
    private PluginFixtureChecks() {}

    static List<Check> inspect(
            JsonNode manifest,
            JsonNode configuration,
            JsonNode fixtures,
            ContentTypeApi catalog,
            ReleaseApi releases,
            JsonMapper json) {
        var checks = new ArrayList<Check>();
        boolean bounded = fixtures.isArray() && !fixtures.isEmpty() && fixtures.size() <= 50;
        checks.add(new Check("fixtures", bounded, "Candidate fixtures must contain 1..50 fixed samples."));
        if (!bounded) return List.copyOf(checks);
        if (!configuration.isObject()) {
            checks.add(new Check("configuration", false, "Source configuration must be an object."));
            return List.copyOf(checks);
        }
        var ids = new HashSet<String>();
        int validations = 0;
        for (var fixture : fixtures) {
            String id = fixture.path("id").asString("");
            String type = fixture.path("contentType").asString("");
            boolean valid = fixture.isObject()
                    && fixture.path("id").isString()
                    && !id.isBlank()
                    && id.length() <= 200
                    && ids.add(id)
                    && fixture.path("label").isString()
                    && !fixture.path("label").asString().isBlank()
                    && fixture.path("label").asString().length() <= 200
                    && fixture.path("contentType").isString()
                    && !type.isBlank()
                    && type.length() <= 128
                    && fixture.path("value").isString()
                    && (!fixture.has("versionRef")
                            || fixture.path("versionRef").isString()
                                    && !fixture.path("versionRef").asString().isBlank()
                                    && fixture.path("versionRef").asString().length() <= 256)
                    && !fixture.has("interpretation");
            String checkId = id.substring(0, Math.min(id.length(), 200));
            checks.add(
                    new Check(
                            "fixture:" + checkId,
                            valid,
                            "Each sample requires a unique bounded id, label, content type, source string, and optional nonblank version reference."));
            if (!valid) continue;
            var views = new ArrayList<JsonNode>();
            for (String family : List.of("editors", "renderers")) {
                var declared = manifest.path(family);
                if (declared.isArray() && declared.size() <= 50)
                    for (var view : declared) {
                        for (var supported : view.path("contentTypes"))
                            if (supported.isString() && supported.asString().equals(type)) {
                                views.add(view);
                                break;
                            }
                    }
            }
            checks.add(new Check(
                    "views:" + checkId, !views.isEmpty(), "A sample must match a declared editor or renderer."));
            if (validations + views.size() > 500) {
                checks.add(new Check(
                        "validation_budget", false, "At most 500 fixture/view pairs may be validated per report."));
                return List.copyOf(checks);
            }
            validations += views.size();
            if (views.isEmpty()) continue;
            String reference = fixture.path("versionRef").asString(null);
            String requested = "requestedVersionRef=" + (reference == null ? "<active>" : reference);
            final ContentTypeSnapshot snapshot;
            try {
                if (reference == null)
                    reference = catalog.state(type)
                            .orElseThrow(ContentTypeApi.Missing::new)
                            .activeVersionRef();
                requested = "requestedVersionRef=" + reference;
                snapshot = catalog.resolve(type, reference, false);
            } catch (ContentTypeApi.Missing | ContentTypeApi.Invalid invalid) {
                for (var view : views)
                    checks.add(new Check(
                            "content:" + checkId + ":" + viewId(view),
                            false,
                            "Trusted content type version is unavailable. " + requested));
                continue;
            }
            String identity = "versionRef=" + snapshot.versionRef() + ", digest=" + snapshot.digest();
            String format =
                    fixture.path("format").asString(snapshot.definition().format());
            for (var view : views) {
                String viewId = viewId(view);
                var merged = json.createObjectNode();
                if (!merge(merged, view.get("config"))
                        || !merge(merged, configuration)
                        || !merge(merged, fixture.get("config"))) {
                    checks.add(new Check(
                            "configuration:" + checkId + ":" + viewId,
                            false,
                            "View and fixture configuration must be objects."));
                    continue;
                }
                try {
                    var interpretation = json.convertValue(
                            merged, new tools.jackson.core.type.TypeReference<Map<String, Object>>() {});
                    var issues = releases.inspectContent(
                            format,
                            fixture.path("value").asString(),
                            ContentProfile.of(format, type, interpretation).bind(snapshot.versionRef()),
                            snapshot.definition());
                    checks.add(new Check(
                            "content:" + checkId + ":" + viewId,
                            issues.isEmpty(),
                            (issues.isEmpty()
                                            ? "Server content validation passed."
                                            : issues.getFirst().code())
                                    + " " + identity));
                } catch (IllegalArgumentException invalid) {
                    checks.add(new Check(
                            "content:" + checkId + ":" + viewId,
                            false,
                            "Interpretation metadata exceeds the supported contract. " + identity));
                }
            }
        }
        return List.copyOf(checks);
    }

    private static String viewId(JsonNode view) {
        String id = view.path("id").asString("");
        return id.substring(0, Math.min(id.length(), 200));
    }

    private static boolean merge(ObjectNode target, JsonNode source) {
        if (source == null || source.isNull()) return true;
        if (!source.isObject()) return false;
        source.properties().forEach(entry -> target.set(entry.getKey(), entry.getValue()));
        return true;
    }
}
