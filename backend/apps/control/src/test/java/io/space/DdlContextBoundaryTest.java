package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * 护栏 D：库表层面的上下文边界——外键是最硬的耦合，一旦跨上下文连上，
 * 两个概念就再也无法独立演进、独立删除、独立迁库。
 *
 * <p>放行两类：同上下文内的外键，以及指向 {@code shared}（共享内核：tenants/webhooks 等）。
 * 其余跨上下文外键必须先登记到下方白名单并附 ADR 理由，否则红。
 */
class DdlContextBoundaryTest {

    private static final Path DDL = Path.of("src/main/resources/db/migration");
    private static final Set<String> CONTEXT_SCHEMAS = Set.of("iam", "authoring", "releases", "hosting");
    private static final String SHARED_KERNEL = "shared";

    /**
     * 经裁决允许的跨上下文外键，格式 "子表schema.子表 -> 父表schema.父表"。
     * releases/hosting 指向 authoring.spaces —— Space 是发布语言里的标识，见 ADR-0009；
     * 已撤销令牌保留历史绑定，ADR-0023取消ApiToken永久外键。
     * 这是精确白名单而非"允许指向 authoring"的通配：新增一条要新增一次 ADR。
     */
    private static final Set<String> APPROVED_CROSS_CONTEXT_REFERENCES = Set.of(
            "releases.releases -> authoring.spaces",
            "releases.release_retention -> authoring.spaces",
            "hosting.sites -> authoring.spaces",
            "hosting.site_mounts -> authoring.spaces");

    private static final Pattern TABLE_STATEMENT =
            Pattern.compile("(?is)\\b(?:create\\s+table(?:\\s+if\\s+not\\s+exists)?|alter\\s+table(?:\\s+only)?)"
                    + "\\s+(\\w+)\\.(\\w+)(.*?);");
    private static final Pattern REFERENCES =
            Pattern.compile("references\\s+(\\w+)\\.(\\w+)", Pattern.CASE_INSENSITIVE);

    @Test
    void foreignKeysStayInsideTheirContextOrPointAtTheSharedKernel() throws IOException {
        var violations = new ArrayList<String>();

        for (Path migration : migrations()) {
            violations.addAll(violationsIn(
                    Files.readString(migration), migration.getFileName().toString()));
        }

        assertThat(violations).as("外键不得跨上下文（shared 共享内核除外）").isEmpty();
    }

    @Test
    void alterTableForeignKeysCannotBypassTheGuard() {
        var violations = violationsIn("""
                alter table authoring.pages
                  add constraint forbidden_author foreign key (created_by) references iam.users(id);
                """, "fixture.sql");

        assertThat(violations).singleElement().asString().contains("authoring.pages -> iam.users");
    }

    @Test
    void alterTableOnlyCannotBypassTheGuard() {
        assertThat(violationsIn(
                        "ALTER TABLE ONLY authoring.pages ADD FOREIGN KEY(created_by) REFERENCES iam.users(id);",
                        "fixture.sql"))
                .singleElement()
                .asString()
                .contains("authoring.pages -> iam.users");
    }

    @Test
    void aPermanentTokenSpaceForeignKeyCannotReturn() {
        assertThat(violationsIn(
                        "ALTER TABLE iam.api_tokens ADD FOREIGN KEY(space_id) REFERENCES authoring.spaces(id);",
                        "fixture.sql"))
                .singleElement()
                .asString()
                .contains("iam.api_tokens -> authoring.spaces");
    }

    private static List<String> violationsIn(String sql, String source) {
        var violations = new ArrayList<String>();
        var tables = TABLE_STATEMENT.matcher(withoutComments(sql));
        while (tables.find()) {
            String owningSchema = tables.group(1).toLowerCase();
            String owningTable = tables.group(2).toLowerCase();
            if (!CONTEXT_SCHEMAS.contains(owningSchema)) {
                continue;
            }
            var references = REFERENCES.matcher(tables.group(3));
            while (references.find()) {
                String targetSchema = references.group(1).toLowerCase();
                if (targetSchema.equals(owningSchema) || targetSchema.equals(SHARED_KERNEL)) {
                    continue;
                }
                String edge = "%s.%s -> %s.%s"
                        .formatted(
                                owningSchema,
                                owningTable,
                                targetSchema,
                                references.group(2).toLowerCase());
                if (!APPROVED_CROSS_CONTEXT_REFERENCES.contains(edge)) {
                    violations.add("%s: %s —— 跨上下文外键须先有 ADR 裁决并登记白名单".formatted(source, edge));
                }
            }
        }
        return violations;
    }

    private static List<Path> migrations() throws IOException {
        try (Stream<Path> files = Files.list(DDL)) {
            return files.filter(path -> path.getFileName().toString().matches("V\\d+__.*\\.sql"))
                    .sorted()
                    .toList();
        }
    }

    private static String withoutComments(String sql) {
        return sql.replaceAll("(?m)--.*$", "");
    }
}
