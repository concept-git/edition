package io.space;

import static org.assertj.core.api.Assertions.*;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/** Each isolated violation exercises the same evaluator as the normal all-unit gate. */
class ArchitectureGuardMutationTest {
    @TempDir
    Path directory;

    @Test
    void rejectsConceptToConceptDependencies() throws Exception {
        rejects("concept independence", "io.space.concepts.page.Seed", "io.space.concepts.user.SeedUser");
    }

    @Test
    void rejectsFrameworkAndSqlTypesInDomain() throws Exception {
        rejects("domain purity", "io.space.concepts.page.domain.Seed", "java.sql.Connection");
    }

    @Test
    void rejectsApplicationToItsOuterAdapter() throws Exception {
        rejects(
                "application ports",
                "io.space.concepts.page.application.Seed",
                "io.space.concepts.page.adapters.SeedStore");
    }

    @Test
    void rejectsPrivateConceptImplementationUse() throws Exception {
        rejects(
                "business exports",
                "io.space.control.compositions.Seed",
                "io.space.concepts.page.application.SeedStore");
    }

    @Test
    void rejectsConstructionOutsideBootstrap() throws Exception {
        rejects(
                "construction access",
                "io.space.control.compositions.Seed",
                "io.space.concepts.page.adapters.SeedModule");
    }

    @Test
    void rejectsConstructionAccessFromTheConceptApplicationLayer() throws Exception {
        rejects(
                "construction access",
                "io.space.concepts.page.application.Seed",
                "io.space.concepts.page.adapters.SeedModule");
    }

    @Test
    void rejectsConceptDependenciesOnApplicationImplementations() throws Exception {
        rejects(
                "concept cannot depend on an application",
                "io.space.concepts.page.application.Seed",
                "io.space.contentapp.compositions.SeedFlow");
    }

    @Test
    void rejectsHttpConceptAccess() throws Exception {
        rejects(
                "HTTP must use composition entries",
                "io.space.control.entry.http.Seed",
                "io.space.concepts.page.SeedApi");
    }

    @Test
    void rejectsTechnicalLibraryCoordination() throws Exception {
        rejects("technical library", "io.space.shared.Seed", "io.space.control.compositions.SeedFlow");
    }

    @Test
    void rejectsCrossApplicationImplementations() throws Exception {
        rejects("application isolation", "io.space.contentapp.compositions.Seed", "io.space.control.compositions.SeedFlow");
    }

    @Test
    void allowsPublicBusinessApiUseByComposition() throws Exception {
        var classes = compiled("io.space.control.compositions.Seed", "io.space.concepts.page.SeedApi");
        assertThat(AllUnitsArchitectureTest.violations(classes, SourceLayout.concepts(), Map.of()))
                .isEmpty();
    }

    private void rejects(String rule, String source, String target) throws Exception {
        var violations =
                AllUnitsArchitectureTest.violations(compiled(source, target), SourceLayout.concepts(), Map.of());
        assertThat(violations)
                .anySatisfy(v -> assertThat(v).contains(rule).contains(source).contains(target));
    }

    private com.tngtech.archunit.core.domain.JavaClasses compiled(String source, String target) throws Exception {
        var output = Files.createDirectories(directory.resolve("classes"));
        var args = new java.util.ArrayList<String>(List.of("-d", output.toString()));
        if (!target.startsWith("java."))
            args.add(write(target, "public class " + simple(target) + " {} ").toString());
        args.add(write(source, "public class " + simple(source) + " { private " + target + " dependency; }")
                .toString());
        assertThat(ToolProvider.getSystemJavaCompiler().run(null, null, null, args.toArray(String[]::new)))
                .isZero();
        return new ClassFileImporter().importPath(output);
    }

    private Path write(String name, String body) throws Exception {
        var source = directory.resolve(name.replace('.', '/') + ".java");
        Files.createDirectories(source.getParent());
        Files.writeString(source, "package " + name.substring(0, name.lastIndexOf('.')) + ";\n" + body);
        return source;
    }

    private String simple(String type) {
        return type.substring(type.lastIndexOf('.') + 1);
    }
}
