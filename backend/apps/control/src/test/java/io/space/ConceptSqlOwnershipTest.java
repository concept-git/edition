package io.space;

import static org.assertj.core.api.Assertions.*;

import com.sun.source.tree.LiteralTree;
import com.sun.source.util.JavacTask;
import com.sun.source.util.TreeScanner;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import javax.tools.SimpleJavaFileObject;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

/** Covers MyBatis and JDBC literals at concept ownership, beyond context-level bytecode checks. */
class ConceptSqlOwnershipTest {
    private static final Pattern RESOURCE = Pattern.compile(
            "(?<![\\w.])(?:shared|iam|authoring|releases|hosting|identity|serving|reader_state)\\.[a-z_][a-z_0-9]*");

    record Ownership(
            String description,
            Map<String, String> stateOwners,
            Set<String> infrastructure,
            Map<String, Set<String>> remoteActions) {}

    private Ownership ownership() throws Exception {
        return JsonMapper.builder()
                .build()
                .readValue(Files.readString(SourceLayout.BACKEND.resolve("sql-ownership.json")), Ownership.class);
    }

    @Test
    void eachConceptReadsAndWritesOnlyOwnedStateOrDeclaredTechnicalProtocols() throws Exception {
        var policy = ownership();
        var violations = new ArrayList<String>();
        int units = 0;
        for (var concept : SourceLayout.concepts()) {
            units++;
            try (var files = Files.walk(concept.sources())) {
                var sources = files.filter(p -> p.toString().endsWith(".java")).toList();
                assertThat(sources).as(concept.project()).isNotEmpty();
                for (Path source : sources)
                    violations.addAll(
                            violations(concept.concept(), source.toString(), Files.readString(source), policy));
            }
        }
        assertThat(units).isEqualTo(37);
        assertThat(violations)
                .as("SQL concept ownership, including JDBC and function calls")
                .isEmpty();
    }

    @Test
    void rejectsSameContextStateReadsAndUnknownFunctions() throws Exception {
        var policy = ownership();
        String source =
                "class Seed { String sql=\"select * from authoring.pages join shared.unowned_function() on true\"; }";
        assertThat(violations("space", "Seed.java", source, policy))
                .hasSize(2)
                .anySatisfy(
                        v -> assertThat(v).contains("space -> authoring.pages").contains("Seed.java"))
                .anySatisfy(v -> assertThat(v).contains("unowned_function"));
    }

    @Test
    void commentsAndPackageNamesCannotMasqueradeAsSqlReferences() throws Exception {
        assertThat(violations(
                        "space",
                        "Seed.java",
                        "package io.space.concepts.page; // authoring.pages\n class Seed {}",
                        ownership()))
                .isEmpty();
    }

    private List<String> violations(String project, String location, String source, Ownership policy) throws Exception {
        var result = new ArrayList<String>();
        var compiler = ToolProvider.getSystemJavaCompiler();
        try (var manager = compiler.getStandardFileManager(null, null, null)) {
            var input =
                    new SimpleJavaFileObject(
                            URI.create("string:///Seed.java"), javax.tools.JavaFileObject.Kind.SOURCE) {
                        @Override
                        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
                            return source;
                        }
                    };
            var task = (JavacTask) compiler.getTask(null, manager, null, List.of("-proc:none"), null, List.of(input));
            for (var unit : task.parse())
                new TreeScanner<Void, Void>() {
                    @Override
                    public Void visitLiteral(LiteralTree literal, Void unused) {
                        if (literal.getValue() instanceof String value && !value.contains("${")) {
                            RESOURCE.matcher(value)
                                    .results()
                                    .map(m -> m.group())
                                    .distinct()
                                    .forEach(resource -> {
                                        if (!project.equals(policy.stateOwners().get(resource))
                                                && !policy.infrastructure().contains(resource)
                                                && !policy.remoteActions()
                                                        .getOrDefault(project, Set.of())
                                                        .contains(resource))
                                            result.add("SQL ownership: " + project + " -> " + resource + " at "
                                                    + location + " (owner="
                                                    + policy.stateOwners().get(resource) + ")");
                                    });
                        }
                        return null;
                    }
                }.scan(unit, null);
        }
        return result;
    }
}
