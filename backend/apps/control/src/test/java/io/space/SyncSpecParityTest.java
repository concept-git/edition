package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import java.io.IOException;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

/**
 * 护栏 C：把「规格与代码可机械 diff」（backend/CLAUDE.md）从承诺变成 CI 事实。
 *
 * <p>Jackson 模型里 sync 是一等公民：SYNCS.md 是真相源，UseCase 与 On 规则类是它的落地。
 * 若代码里出现规格没有的 sync（曾真实发生：verify 的 400 错误分支先有实现后有规格），
 * 全套测试照样绿——本测试专抓这一类漂移：实现与同包 SYNCS.md 必须双向同名。
 */
class SyncSpecParityTest {

    private static final Path SOURCE_ROOT = Path.of("src/main/java");
    private static final Pattern DECLARED_SYNC = Pattern.compile("(?m)^sync\\s+(\\w+)");

    @Test
    void eachFlowHasCompleteRuleImplementations() {
        var entries = syncsClasses().stream().collect(Collectors.groupingBy(JavaClass::getPackageName));
        for (Path spec : syncSpecs()) {
            if (!declaredSyncNames(spec).isEmpty()) {
                assertThat(entries.getOrDefault(packageFor(spec), List.of()))
                        .as("声明规则的组合必须具有实际实现：%s", spec)
                        .isNotEmpty();
            }
        }
        for (JavaClass entry : syncsClasses()) {
            assertThat(isRule(entry)).as(entry.getName()).isTrue();
            assertThat(java.util.Arrays.stream(entry.reflect().getDeclaredMethods())
                            .filter(method -> !method.isSynthetic())
                            .map(Method::getName)
                            .collect(Collectors.toSet()))
                    .as("规则类的方法名就是 sync 身份：%s", entry.getName())
                    .isNotEmpty()
                    .allMatch(name -> declaredSyncNames(specFor(entry)).contains(name));
        }
    }

    @Test
    void eachRuleHasOneImplementationOwner() {
        var owners = new java.util.TreeMap<String, Set<String>>();
        for (JavaClass type : syncsClasses()) {
            for (Method method : type.reflect().getDeclaredMethods()) {
                if (!method.isSynthetic())
                    owners.computeIfAbsent(method.getName(), ignored -> new HashSet<>())
                            .add(type.getName());
            }
        }
        owners.forEach(
                (id, implementations) -> assertThat(implementations).as(id).hasSize(1));
    }

    @Test
    void syncNamesAreUniqueAcrossTheApplication() {
        var owners = new java.util.HashMap<String, Path>();
        var duplicates = new ArrayList<String>();
        for (Path spec : syncSpecs()) {
            for (String name : declaredSyncOccurrences(spec)) {
                Path previous = owners.putIfAbsent(name, spec);
                if (previous != null) {
                    duplicates.add("%s: %s 与 %s".formatted(name, previous, spec));
                }
            }
        }
        assertThat(duplicates).as("sync 是应用内唯一的规则名").isEmpty();
    }

    @Test
    void ruleBlocksCloseBeforeTheNextRule() throws IOException {
        var violations = new ArrayList<String>();
        for (Path spec : syncSpecs()) {
            String open = null;
            int startLine = 0;
            List<String> lines = Files.readAllLines(spec);
            for (int i = 0; i < lines.size(); i++) {
                String line = lines.get(i).strip();
                if (line.equals("when {") || line.equals("where {") || line.equals("then {")) {
                    if (open != null) violations.add("%s:%d 的 %s 未闭合".formatted(spec, startLine, open));
                    open = line;
                    startLine = i + 1;
                } else if (line.equals("}")) {
                    open = null;
                } else if (open != null && (line.startsWith("sync ") || line.startsWith("mediator branch "))) {
                    violations.add("%s:%d 的 %s 在下一条规则前未闭合".formatted(spec, startLine, open));
                    open = null;
                }
            }
            if (open != null) violations.add("%s:%d 的 %s 到文件结束仍未闭合".formatted(spec, startLine, open));
        }
        assertThat(violations).as("when/where/then 必须独立闭合，避免后续规则被吞并").isEmpty();
    }

    @Test
    void everyImplementedSyncMethodIsDeclaredInItsSyncsSpec() {
        var violations = new ArrayList<String>();

        for (JavaClass syncs : syncsClasses()) {
            Path spec = specFor(syncs);
            Set<String> declared = declaredSyncNames(spec);

            for (Method method : syncs.reflect().getDeclaredMethods()) {
                if (method.isSynthetic()) {
                    continue;
                }
                if (!declared.contains(method.getName())) {
                    violations.add("%s.%s 没有对应的 sync 声明 —— 先改 %s 再改代码（规格是真相源）"
                            .formatted(syncs.getSimpleName(), method.getName(), spec));
                }
            }
        }

        assertThat(violations).as("每个 sync 方法都必须在同包 SYNCS.md 中声明").isEmpty();
    }

    @Test
    void everyDeclaredSyncInAnImplementedFlowHasAMethodInItsPackage() {
        var violations = new ArrayList<String>();
        List<JavaClass> classes = syncsClasses();

        for (Path spec : syncSpecs()) {
            String packageName = packageFor(spec);
            Set<String> implemented = classes.stream()
                    .filter(syncs -> syncs.getPackageName().equals(packageName))
                    .flatMap(syncs -> java.util.Arrays.stream(syncs.reflect().getDeclaredMethods()))
                    .filter(method -> !method.isSynthetic())
                    .map(Method::getName)
                    .collect(Collectors.toCollection(HashSet::new));
            for (String declared : declaredSyncNames(spec)) {
                if (!implemented.contains(declared)) {
                    violations.add("%s 声明的 sync %s 没有对应的 UseCase 或 On 方法".formatted(spec, declared));
                }
            }
        }

        assertThat(violations).as("规格里的每条 sync 都必须在同包 *Syncs 类中实现").isEmpty();
    }

    @Test
    void everySyncsPackageShipsItsSpec() {
        for (JavaClass syncs : syncsClasses()) {
            assertThat(specFor(syncs))
                    .as("flow 规格随包共存（%s）", syncs.getSimpleName())
                    .exists();
        }
    }

    @Test
    void aggregateSyncsClassesAreRetired() {
        var classes = new ClassFileImporter().importPackages("io.space.control.compositions");
        assertThat(classes).noneMatch(type -> type.getSimpleName().endsWith("Syncs"));
    }

    private static boolean isRule(JavaClass type) {
        if (type.getName().contains("$")) return false;
        String name = type.getSimpleName();
        return name.endsWith("UseCase")
                || name.endsWith("OnCompletion")
                || name.endsWith("OnSchedule")
                || name.matches(".*On[A-Z].*");
    }

    private static List<JavaClass> syncsClasses() {
        return new ClassFileImporter()
                        .importPackages("io.space.control.compositions")
                        .that(com.tngtech.archunit.base.DescribedPredicate.describe(
                                "flow 类（UseCase / On）", javaClass -> isRule(javaClass)))
                        .stream()
                        .toList();
    }

    private static Path specFor(JavaClass syncs) {
        return SOURCE_ROOT.resolve(syncs.getPackageName().replace('.', '/')).resolve("SYNCS.md");
    }

    private static Set<String> declaredSyncNames(Path spec) {
        return Set.copyOf(declaredSyncOccurrences(spec));
    }

    private static List<String> declaredSyncOccurrences(Path spec) {
        if (!Files.exists(spec)) {
            return List.of();
        }
        try {
            return DECLARED_SYNC
                    .matcher(Files.readString(spec))
                    .results()
                    .map(match -> match.group(1))
                    .toList();
        } catch (IOException e) {
            throw new IllegalStateException("无法读取 flow 规格: " + spec, e);
        }
    }

    private static List<Path> syncSpecs() {
        Path syncRoot = SOURCE_ROOT.resolve("io/space/control/compositions");
        try (var paths = Files.walk(syncRoot)) {
            return paths.filter(path -> path.getFileName().toString().equals("SYNCS.md"))
                    .toList();
        } catch (IOException e) {
            throw new IllegalStateException("无法枚举 sync 规格", e);
        }
    }

    private static String packageFor(Path spec) {
        Path relative = SOURCE_ROOT.relativize(spec.getParent());
        return relative.toString().replace(java.io.File.separatorChar, '.');
    }
}
