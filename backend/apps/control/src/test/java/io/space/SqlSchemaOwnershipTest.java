package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.junit.jupiter.api.Test;

/**
 * 护栏 B：SQL 层的归属检查——字节码依赖分析的盲区。
 *
 * <p>ArchUnit 与 Modulith 都只看类型依赖，而 {@code @Select("select … from iam.users")}
 * 写在 authoring 的 mapper 里不产生任何类型依赖，全部现有护栏一律放行。这是模块单体最
 * 隐蔽的耦合路径：库表被跨上下文直读，模块边界名存实亡。本测试断言每个 mapper 的 SQL
 * 只触碰**本上下文 schema** 与 **shared**（共享内核：tenants、current_tenant_id 等）。
 */
class SqlSchemaOwnershipTest {

    /** 上下文 schema 全集；shared 是共享内核，人人可读。 */
    private static final Set<String> CONTEXT_SCHEMAS = Set.of("iam", "authoring", "releases", "hosting");

    private static final String SHARED_SCHEMA = "shared";

    private static final Pattern SCHEMA_REFERENCE =
            Pattern.compile("\\b(" + String.join("|", CONTEXT_SCHEMAS) + ")\\.");

    @Test
    void everyMapperOnlyReadsItsOwnContextSchema() throws IOException {
        var violations = new ArrayList<String>();
        var contexts = SourceLayout.concepts().stream()
                .collect(Collectors.toMap(SourceLayout.Concept::packageName, SourceLayout.Concept::context));

        for (JavaClass mapper : new ClassFileImporter().importPackages("io.space")) {
            if (!mapper.isAnnotatedWith(Mapper.class)) {
                continue;
            }
            String owningContext = contextOf(mapper.getName(), contexts);
            for (Method method : mapper.reflect().getDeclaredMethods()) {
                for (String sql : statementsOf(method)) {
                    SCHEMA_REFERENCE
                            .matcher(sql)
                            .results()
                            .map(match -> match.group(1))
                            .distinct()
                            .filter(schema -> !schema.equals(owningContext))
                            .forEach(schema -> violations.add("%s.%s 触碰了 %s.* —— 本模块属于 %s 上下文，跨上下文取数须走组合层"
                                    .formatted(mapper.getSimpleName(), method.getName(), schema, owningContext)));
                }
            }
        }

        assertThat(violations)
                .as("mapper 的 SQL 只可触碰本上下文 schema 与 " + SHARED_SCHEMA)
                .isEmpty();
    }

    private static String contextOf(String className, Map<String, String> contexts) {
        return contexts.entrySet().stream()
                .filter(entry -> className.startsWith(entry.getKey() + "."))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("mapper 的概念未登记: " + className));
    }

    private static List<String> statementsOf(Method method) {
        var statements = new ArrayList<String>();
        for (Select annotation : method.getAnnotationsByType(Select.class)) {
            statements.addAll(List.of(annotation.value()));
        }
        for (Insert annotation : method.getAnnotationsByType(Insert.class)) {
            statements.addAll(List.of(annotation.value()));
        }
        for (Update annotation : method.getAnnotationsByType(Update.class)) {
            statements.addAll(List.of(annotation.value()));
        }
        for (Delete annotation : method.getAnnotationsByType(Delete.class)) {
            statements.addAll(List.of(annotation.value()));
        }
        return statements;
    }
}
