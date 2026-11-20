package io.space;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import tools.jackson.databind.json.JsonMapper;

/** Resolves authoritative specifications across independently built concept projects. */
final class SourceLayout {
    static final Path BACKEND = Path.of(System.getProperty("space.backend.root", "../../.."))
            .toAbsolutePath()
            .normalize();
    static final Path REPOSITORY = BACKEND.getParent();

    record Concept(String name, String context, String concept, String project, String directory, String packageName) {
        Path root() {
            return BACKEND.resolve(directory);
        }

        Path spec() {
            return root().resolve("CONCEPT.md");
        }

        Path sources() {
            return root().resolve("src/main/java");
        }
    }

    static List<Concept> concepts() throws IOException {
        var root = JsonMapper.builder().build().readTree(Files.readString(BACKEND.resolve("concept-modules.json")));
        var concepts = new ArrayList<Concept>();
        for (var node : root.get("concepts")) {
            concepts.add(new Concept(
                    node.get("name").asString(),
                    node.get("context").asString(),
                    node.get("concept").asString(),
                    node.get("project").asString(),
                    node.get("directory").asString(),
                    node.get("package").asString()));
        }
        return List.copyOf(concepts);
    }

    static Class<?> load(Path source) throws IOException, ClassNotFoundException {
        var match =
                java.util.regex.Pattern.compile("(?m)^package\\s+([\\w.]+);").matcher(Files.readString(source));
        if (!match.find()) throw new IllegalArgumentException("Missing package: " + source);
        return Class.forName(
                match.group(1) + "." + source.getFileName().toString().replace(".java", ""));
    }

    private SourceLayout() {}
}
