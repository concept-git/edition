package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/** Inspects actual class outputs from every production project without loading foreign applications. */
class AllUnitsArchitectureTest {
    @Test
    void conceptsExposeBusinessContractsAndBootstrapOnlyConstructionEntries() throws Exception {
        String configured = System.getProperty("space.architecture.classRoots");
        assertThat(configured)
                .as("Gradle must supply actual class outputs for all production units")
                .isNotBlank();
        var roots = Arrays.stream(configured.split(Pattern.quote(File.pathSeparator)))
                .map(Path::of)
                .toList();
        var concepts = SourceLayout.concepts();
        for (var concept : concepts) {
            Path classes = concept.root().resolve("build/classes/java/main");
            assertThat(roots).contains(classes);
            try (var files = Files.walk(classes)) {
                assertThat(files.anyMatch(p -> p.toString().endsWith(".class")))
                        .as(concept.project())
                        .isTrue();
            }
        }
        for (String app : List.of("control", "index", "content")) {
            assertThat(roots).contains(SourceLayout.BACKEND.resolve("apps/" + app + "/build/classes/java/main"));
        }
        var classes = new ClassFileImporter().importPaths(roots);
        Map<String, List<String>> namedPackages = new TreeMap<>();
        for (var concept : concepts) {
            var names = new ArrayList<String>();
            try (var files = Files.walk(concept.sources())) {
                for (Path source : files.filter(p -> p.getFileName().toString().equals("package-info.java"))
                        .toList()) {
                    String text = Files.readString(source);
                    if (text.contains("NamedInterface(")) {
                        var match =
                                Pattern.compile("(?m)^package\\s+([\\w.]+);").matcher(text);
                        assertThat(match.find()).as(source.toString()).isTrue();
                        names.add(match.group(1));
                    }
                }
            }
            namedPackages.put(concept.packageName(), List.copyOf(names));
            assertThat(classes)
                    .anyMatch(c -> c.getName()
                            .equals(concept.packageName() + ".adapters." + concept.name() + "Configuration"));
        }
        assertThat(violations(classes, concepts, namedPackages))
                .as("All production units preserve concept, public API, construction and HTTP boundaries")
                .isEmpty();
    }

    static List<String> violations(
            com.tngtech.archunit.core.domain.JavaClasses classes,
            List<SourceLayout.Concept> concepts,
            Map<String, List<String>> namedPackages) {
        var violations = new ArrayList<String>();
        for (JavaClass source : classes) {
            if (!source.getPackageName().startsWith("io.space")) continue;
            String owner = owner(source, concepts);
            source.getDirectDependenciesFromSelf().forEach(dependency -> {
                JavaClass target = dependency.getTargetClass();
                String targetOwner = owner(target, concepts);
                if (source.getPackageName().contains(".domain")
                        && (target.getName().startsWith("org.springframework.")
                                || target.getName().startsWith("org.apache.ibatis.")
                                || target.getName().startsWith("java.sql.")
                                || target.getPackageName().contains(".application")
                                || target.getPackageName().contains(".adapters"))) {
                    violations.add("domain purity: " + dependency.getDescription());
                }
                if (owner != null
                        && source.getPackageName().contains(".application")
                        && targetOwner != null
                        && owner.equals(targetOwner)
                        && (target.getPackageName().equals(owner + ".adapters")
                                || target.getPackageName().startsWith(owner + ".adapters."))) {
                    violations.add("application ports: " + dependency.getDescription());
                }
                if (owner != null && targetOwner != null && !owner.equals(targetOwner)) {
                    violations.add("concept independence: " + dependency.getDescription());
                }
                if ((source.getPackageName().startsWith("io.space.contentapp.")
                                || source.getPackageName().startsWith("io.space.index."))
                        && targetOwner != null) {
                    violations.add("runtime isolation: " + dependency.getDescription());
                }
                boolean technical = source.getPackageName()
                        .matches(
                                "io\\.space\\.(?:shared|content|requestcontext|delivery\\.(?:contract|store))(?:\\..*)?");
                if (technical && (targetOwner != null || applicationOf(target) != null)) {
                    violations.add("technical library: " + dependency.getDescription());
                }
                String sourceApp = applicationOf(source), targetApp = applicationOf(target);
                if (sourceApp != null && targetApp != null && !sourceApp.equals(targetApp)) {
                    violations.add("application isolation: " + dependency.getDescription());
                }
                if (owner != null && targetApp != null) {
                    violations.add("concept cannot depend on an application: " + dependency.getDescription());
                }
                boolean construction = targetOwner != null && inPackage(target, targetOwner + ".adapters");
                boolean bootstrap = source.getPackageName()
                        .matches("io\\.space\\.(?:control|contentapp|index)\\.bootstrap(?:\\..*)?");
                boolean ownAssembly =
                        targetOwner != null && targetOwner.equals(owner) && inPackage(source, owner + ".adapters");
                if (construction && !bootstrap && !ownAssembly) {
                    violations.add("construction access: " + dependency.getDescription());
                }
                if (targetOwner == null || targetOwner.equals(owner)) return;
                if (!construction
                        && !target.getPackageName().equals(targetOwner)
                        && namedPackages.getOrDefault(targetOwner, List.of()).stream()
                                .noneMatch(p -> target.getPackageName().equals(p)
                                        || target.getPackageName().startsWith(p + "."))) {
                    violations.add("business exports: " + dependency.getDescription());
                }
                if (source.getPackageName().matches("io\\.space\\.control\\.entry\\.http(?:\\..*)?")) {
                    violations.add("HTTP must use composition entries: " + dependency.getDescription());
                }
            });
        }
        return violations;
    }

    private static boolean inPackage(JavaClass type, String prefix) {
        return type.getPackageName().equals(prefix) || type.getPackageName().startsWith(prefix + ".");
    }

    private static String applicationOf(JavaClass type) {
        return List.of("control", "contentapp", "index").stream()
                .filter(app -> type.getPackageName().equals("io.space." + app)
                        || type.getPackageName().startsWith("io.space." + app + "."))
                .findFirst()
                .orElse(null);
    }

    private static String owner(JavaClass type, List<SourceLayout.Concept> concepts) {
        return concepts.stream()
                .map(SourceLayout.Concept::packageName)
                .filter(p ->
                        type.getPackageName().equals(p) || type.getPackageName().startsWith(p + "."))
                .findFirst()
                .orElse(null);
    }
}
