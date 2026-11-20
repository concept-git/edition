package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.*;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/**
 * PRD inventory and zero-cross-concept dependency rule checked against the actual Modulith model.
 */
class PrdModuleInventoryTest {
    @Test
    void prdConceptInventoryMatchesRuntimeModulesAndTheirDependencyBoundary() throws Exception {
        Path project = SourceLayout.REPOSITORY;
        String prd = Files.readString(project.resolve("docs/prd/README.md"));
        var inventory = SourceLayout.concepts();
        assertThat(inventory).hasSize(37);
        assertThat(inventory.stream().filter(c -> c.context().equals("platform")))
                .hasSize(18);
        assertThat(inventory.stream().filter(c -> !c.context().equals("platform")))
                .hasSize(19);
        var expected = inventory.stream()
                .map(SourceLayout.Concept::packageName)
                .collect(Collectors.toCollection(TreeSet::new));
        for (var concept : inventory) {
            assertThat(prd).contains("../../backend/" + concept.directory() + "/CONCEPT.md");
            assertThat(concept.root().resolve("build.gradle.kts")).exists();
            assertThat(concept.spec()).exists();
        }
        var modules = ApplicationModules.of(SpaceApplication.class);
        var concepts = modules.stream()
                .filter(module -> expected.contains(module.getBasePackage().getName()))
                .toList();
        assertThat(expected).hasSize(37);
        assertThat(concepts.stream()
                        .map(module -> module.getBasePackage().getName())
                        .toList())
                .containsExactlyInAnyOrderElementsOf(expected);
        var dependencies = new TreeMap<String, List<String>>();
        for (var module : concepts) {
            String basePackage = module.getBasePackage().getName();
            Path spec = inventory.stream()
                    .filter(c -> c.packageName().equals(basePackage))
                    .findFirst()
                    .orElseThrow()
                    .spec();
            var title = Pattern.compile("(?m)^# concept (\\w+)").matcher(Files.readString(spec));
            assertThat(title.find()).as("概念必须具有具名标题：%s", spec).isTrue();
            String conceptName = title.group(1);
            assertThat(module.getDisplayName()).as(basePackage).isEqualTo(conceptName);
            assertThat(basePackage.substring(basePackage.lastIndexOf('.') + 1))
                    .as("概念叶包必须与概念名一致：%s", basePackage)
                    .isEqualTo(conceptName.toLowerCase(Locale.ROOT));
            var targets = module.getDirectDependencies(modules).stream()
                    .map(dependency ->
                            dependency.getTargetModule().getBasePackage().getName())
                    .distinct()
                    .sorted()
                    .toList();
            assertThat(targets).as(module.getBasePackage().getName()).allMatch("io.space.shared"::equals);
            dependencies.put(module.getBasePackage().getName(), targets);
        }
        Path output = project.resolve("backend/apps/control/build/spring-modulith-docs/prd-module-inventory.json");
        Files.createDirectories(output.getParent());
        Files.writeString(
                output,
                tools.jackson.databind.json.JsonMapper.builder()
                                .build()
                                .writerWithDefaultPrettyPrinter()
                                .writeValueAsString(
                                        Map.of("matched", true, "concepts", expected, "dependencies", dependencies))
                        + "\n");
    }
}
