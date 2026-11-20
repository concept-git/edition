package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.lang.reflect.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

/** Complete interface mappings complement behavioral specifications and scenario tests. */
class SpecificationInterfaceParityTest {
    private static final Path SOURCE = Path.of("src/main/java");
    private static final String START = "<!-- interface-contract:start -->";
    private static final String END = "<!-- interface-contract:end -->";

    @Test
    void conceptsAndFlowsDocumentTheirCompleteInputAndResultTypes() throws Exception {
        var contracts = new TreeMap<Path, List<Class<?>>>();
        for (var concept : SourceLayout.concepts()) {
            if (concept.context().equals("platform")) {
                assertThat(concept.spec()).exists();
                var exports = PlatformConceptSpecParityTest.APIS.get(concept.concept());
                assertThat(exports).as(concept.name()).isNotEmpty();
                contracts.put(concept.spec(), new ArrayList<>(Arrays.asList(exports)));
                continue;
            }
            try (var files = Files.walk(concept.sources())) {
                for (Path source : files.filter(p -> (p.toString().endsWith("Api.java")
                                || p.toString().endsWith("Backend.java")))
                        .toList()) {
                    assertThat(concept.spec()).exists();
                    contracts
                            .computeIfAbsent(concept.spec(), ignored -> new ArrayList<>())
                            .add(SourceLayout.load(source));
                }
            }
        }
        try (var files = Files.walk(SOURCE.resolve("io/space/control/compositions"))) {
            for (Path source : files.filter(p -> p.toString().endsWith("UseCase.java")
                            || p.toString().endsWith("OnCompletion.java")
                            || p.toString().endsWith("OnSchedule.java")
                            || p.getFileName().toString().matches(".*On[A-Z].*\\.java")
                            || (p.toString().endsWith("Sync.java")
                                    && Files.isRegularFile(p.getParent().resolve("SYNCS.md")))
                            || ((p.toString().endsWith("Types.java")
                                            || p.toString().endsWith("Signals.java"))
                                    && Files.isRegularFile(p.getParent().resolve("SYNCS.md"))))
                    .toList()) {
                Path spec = source.getParent().resolve("SYNCS.md");
                assertThat(spec).exists();
                contracts.computeIfAbsent(spec, ignored -> new ArrayList<>()).add(load(source));
            }
        }
        boolean update = "true".equals(System.getenv("UPDATE_SPEC_INTERFACES"));
        var differences = new ArrayList<String>();
        for (var entry : contracts.entrySet()) {
            String doc = Files.readString(entry.getKey());
            String expected = mapping(entry.getValue());
            int start = doc.indexOf(START), end = doc.indexOf(END);
            if (update) {
                String before = start < 0 ? doc.stripTrailing() + "\n\n" : doc.substring(0, start);
                String after = end < 0 ? "\n" : doc.substring(end + END.length());
                Files.writeString(entry.getKey(), before + expected + after);
            } else if (start < 0
                    || end < start
                    || !doc.substring(start, end + END.length()).equals(expected)) {
                differences.add(entry.getKey().toString());
            }
        }
        assertThat(differences)
                .as("完整接口映射已漂移；先确认行为契约，再显式UPDATE_SPEC_INTERFACES=true转录并审阅差异")
                .isEmpty();
    }

    private static Class<?> load(Path source) throws ClassNotFoundException {
        try {
            return SourceLayout.load(source);
        } catch (IOException failure) {
            throw new IllegalStateException("Cannot read " + source, failure);
        }
    }

    private static String mapping(List<Class<?>> interfaces) {
        var methods = new TreeSet<String>();
        var shapes = new TreeSet<String>();
        for (Class<?> api : interfaces) {
            for (Method method : api.getDeclaredMethods()) {
                boolean rules = api.getSimpleName().endsWith("Syncs");
                if (method.isSynthetic()
                        || (!rules
                                && (!Modifier.isPublic(method.getModifiers())
                                        || Modifier.isStatic(method.getModifiers())))) continue;
                assertThat(Arrays.stream(method.getParameters()).allMatch(Parameter::isNamePresent))
                        .as(
                                "Named contract inputs must survive independent compilation: %s.%s",
                                api.getName(), method.getName())
                        .isTrue();
                String parameters = Arrays.stream(method.getParameters())
                        .map(p -> p.getName() + ": " + type(p.getParameterizedType()))
                        .collect(Collectors.joining(", "));
                methods.add("| `" + api.getSimpleName() + "." + method.getName() + "` | `" + parameters + "` | `"
                        + type(method.getGenericReturnType()) + "` |");
            }
            shapes(api, shapes);
        }
        return START + "\n\n### 实现接口映射\n\n"
                + "下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，"
                + "查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。"
                + "此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。\n\n"
                + "| 方法 | 具名输入 | 返回类型 |\n| --- | --- | --- |\n"
                + String.join("\n", methods) + "\n\n"
                + "| 类型 | 字段／封闭分支 |\n| --- | --- |\n"
                + String.join("\n", shapes) + "\n\n" + END;
    }

    private static void shapes(Class<?> owner, Set<String> rows) {
        for (Class<?> nested : owner.getDeclaredClasses()) {
            if (nested.isSynthetic()) continue;
            String definition = null;
            if (nested.isRecord()) {
                definition = Arrays.stream(nested.getRecordComponents())
                        .map(c -> c.getName() + ": " + type(c.getGenericType()))
                        .collect(Collectors.joining(", "));
                if (definition.isEmpty()) definition = "[]";
            } else if (nested.isEnum()) {
                definition = Arrays.stream(nested.getEnumConstants())
                        .map(v -> ((Enum<?>) v).name())
                        .collect(Collectors.joining(" / "));
            } else if (nested.isSealed()) {
                definition = Arrays.stream(nested.getPermittedSubclasses())
                        .map(SpecificationInterfaceParityTest::type)
                        .sorted()
                        .collect(Collectors.joining(" / "));
            }
            if (definition != null) rows.add("| `" + type(nested) + "` | `" + definition + "` |");
            shapes(nested, rows);
        }
    }

    private static String type(Type value) {
        if (value instanceof Class<?> c) {
            if (c.isPrimitive()) return c.getName();
            if (c.isArray()) return type(c.componentType()) + "[]";
            return c.getName()
                    .substring(
                            c.getPackageName().isEmpty()
                                    ? 0
                                    : c.getPackageName().length() + 1)
                    .replace('$', '.');
        }
        if (value instanceof ParameterizedType p)
            return type(p.getRawType()) + "<"
                    + Arrays.stream(p.getActualTypeArguments())
                            .map(SpecificationInterfaceParityTest::type)
                            .collect(Collectors.joining(", "))
                    + ">";
        if (value instanceof TypeVariable<?> v) return v.getName();
        if (value instanceof WildcardType w) {
            if (w.getLowerBounds().length > 0) return "? super " + type(w.getLowerBounds()[0]);
            if (w.getUpperBounds().length > 0 && w.getUpperBounds()[0] != Object.class)
                return "? extends " + type(w.getUpperBounds()[0]);
            return "?";
        }
        if (value instanceof GenericArrayType a) return type(a.getGenericComponentType()) + "[]";
        throw new IllegalArgumentException("unhandled contract type " + value);
    }
}
