package io.space.content;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Passive build-time metadata shared by control and reader. No executable plugin code is loaded. */
public record ContentPluginDescriptors(int apiVersion, List<Type> types, List<Plugin> plugins) {
    public ContentPluginDescriptors {
        if (apiVersion != 1 || types == null || types.isEmpty() || plugins == null || plugins.isEmpty())
            throw new IllegalArgumentException("Unsupported or empty content plugin descriptors");
        types = List.copyOf(types);
        plugins = List.copyOf(plugins);
        var ids = new HashSet<String>();
        for (Type type : types) {
            if (!ids.add(type.id())) throw new IllegalArgumentException("Duplicate content type: " + type.id());
        }
        var pluginIds = new HashSet<String>();
        var renderedTypes = new HashSet<String>();
        for (Plugin plugin : plugins) {
            Manifest manifest = plugin.manifest();
            if (!pluginIds.add(manifest.id())) throw new IllegalArgumentException("Duplicate plugin: " + manifest.id());
            if (!ids.containsAll(manifest.contentTypes()))
                throw new IllegalArgumentException("Plugin refers to an unregistered content type: " + manifest.id());
            for (View renderer : manifest.renderers()) renderedTypes.addAll(renderer.contentTypes());
        }
        if (!renderedTypes.containsAll(ids))
            throw new IllegalArgumentException("Every registered content type requires a renderer contribution");
    }

    public record Type(
            String id,
            String version,
            String label,
            String format,
            String mediaType,
            String language,
            String renderHost,
            Map<String, Object> defaultInterpretation,
            ContentTypeDefinition.Validation validation,
            Map<String, String> schemaResources,
            List<ContentTypeDefinition.Contribution> editors,
            List<ContentTypeDefinition.Contribution> renderers) {
        public Type {
            if (id == null || !id.matches("[a-z][a-z0-9/-]{0,127}"))
                throw new IllegalArgumentException("Invalid content type identity");
            if (version == null
                    || version.isBlank()
                    || label == null
                    || label.isBlank()
                    || mediaType == null
                    || mediaType.isBlank()
                    || language == null
                    || language.isBlank())
                throw new IllegalArgumentException("Incomplete content type descriptor: " + id);
            if (DocumentFormat.fromWire(format).isEmpty())
                throw new IllegalArgumentException("Unsupported source format: " + format);
            if (renderHost == null || !Set.of("server", "browser").contains(renderHost))
                throw new IllegalArgumentException("Unknown content render host: " + renderHost);
            defaultInterpretation = JsonValues.object(defaultInterpretation);
            schemaResources = schemaResources == null ? Map.of() : Map.copyOf(schemaResources);
            editors = editors == null ? List.of() : List.copyOf(editors);
            renderers = renderers == null ? List.of() : List.copyOf(renderers);
        }

        /** Pure projection with the complete schema closure resolved by the caller. */
        public ContentTypeDefinition definition(Map<String, String> resolvedSchemas) {
            return new ContentTypeDefinition(
                    id,
                    version,
                    label,
                    format,
                    mediaType,
                    language,
                    renderHost,
                    defaultInterpretation,
                    validation,
                    resolvedSchemas,
                    editors,
                    renderers);
        }
    }

    public record Plugin(Manifest manifest, String editorEntry, String rendererEntry) {
        public Plugin {
            if (manifest == null) throw new IllegalArgumentException("Missing plugin manifest");
            if ((!manifest.editors().isEmpty() && (editorEntry == null || editorEntry.isBlank()))
                    || (!manifest.renderers().isEmpty() && (rendererEntry == null || rendererEntry.isBlank())))
                throw new IllegalArgumentException("Missing contribution entry for plugin: " + manifest.id());
        }
    }

    public record Manifest(
            String id,
            String name,
            String version,
            int apiVersion,
            List<String> contentTypes,
            List<View> editors,
            List<View> renderers,
            String description) {
        public Manifest {
            if (id == null
                    || id.isBlank()
                    || name == null
                    || name.isBlank()
                    || version == null
                    || version.isBlank()
                    || apiVersion != 1
                    || contentTypes == null
                    || contentTypes.isEmpty()
                    || editors == null
                    || renderers == null) throw new IllegalArgumentException("Invalid content plugin manifest");
            contentTypes = List.copyOf(contentTypes);
            editors = List.copyOf(editors);
            renderers = List.copyOf(renderers);
            if (new HashSet<>(contentTypes).size() != contentTypes.size())
                throw new IllegalArgumentException("Duplicate plugin content type: " + id);
            for (var family : List.of(editors, renderers)) {
                var ids = new HashSet<String>();
                for (View view : family) {
                    if (!ids.add(view.id()) || !contentTypes.containsAll(view.contentTypes()))
                        throw new IllegalArgumentException("Invalid contribution identity or content type: " + id);
                }
            }
        }
    }

    public record View(String id, String label, String tagName, List<String> contentTypes, Map<String, Object> config) {
        public View {
            if (id == null
                    || id.isBlank()
                    || label == null
                    || label.isBlank()
                    || tagName == null
                    || !tagName.matches("[a-z][a-z0-9]*(?:-[a-z0-9]+)+")
                    || contentTypes == null
                    || contentTypes.isEmpty())
                throw new IllegalArgumentException("Invalid content plugin view contribution");
            contentTypes = List.copyOf(contentTypes);
            config = config == null ? Map.of() : config;
        }
    }
}
