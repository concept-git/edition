package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/** A foreign key may enforce a reference, but may not mutate a different concept. */
class ConceptCascadeBoundaryTest {
    private static final List<Set<String>> OWNED_TABLES = List.of(
            Set.of("authoring.pages", "authoring.attachments"),
            Set.of("authoring.spaces", "authoring.space_page_placements"),
            Set.of("authoring.collections", "authoring.collection_spaces"),
            Set.of("authoring.page_tags"),
            Set.of("authoring.revisions"),
            Set.of("authoring.toc_entries"),
            Set.of("hosting.sites", "hosting.site_mounts"),
            Set.of("hosting.search_settings"),
            Set.of("hosting.redirects"),
            Set.of("hosting.custom_domains"),
            Set.of("iam.users"),
            Set.of("iam.sessions"),
            Set.of("iam.api_tokens"),
            Set.of("iam.management_tokens"),
            Set.of("iam.teams"),
            Set.of("iam.memberships", "iam.invites"),
            Set.of(
                    "iam.permission_grants",
                    "iam.permission_roles",
                    "iam.permission_restrictions",
                    "iam.permission_restriction_scopes"),
            Set.of(
                    "releases.releases",
                    "releases.release_contents",
                    "releases.release_pages",
                    "releases.release_pins",
                    "releases.release_retention",
                    "releases.release_toc"));
    private static final Pattern TABLE =
            Pattern.compile("(?is)\\b(?:create\\s+table(?:\\s+if\\s+not\\s+exists)?|alter\\s+table(?:\\s+only)?)"
                    + "\\s+(\\w+\\.\\w+)(.*?);");
    private static final Pattern REFERENCE =
            Pattern.compile("(?is)\\breferences\\s+(\\w+\\.\\w+)\\s*\\([^)]*\\)(.*?)(?=\\breferences\\b|$)");
    private static final Pattern MUTATION =
            Pattern.compile("(?is)\\bon\\s+(?:delete|update)\\s+(?:cascade|set\\s+null|set\\s+default)\\b");

    @Test
    void foreignKeysCannotPerformAnotherConceptsActions() throws Exception {
        var violations = new ArrayList<String>();
        try (var files = Files.list(Path.of("src/main/resources/db/migration"))) {
            for (var file : files.filter(p -> p.getFileName().toString().matches("V\\d+__.*\\.sql"))
                    .toList()) {
                violations.addAll(violations(Files.readString(file)));
            }
        }
        assertThat(violations).as("跨概念清理必须由同步显式调用概念动作").isEmpty();
    }

    @Test
    void detectsInlineAndAlterReferencesButAllowsInternalCascades() {
        assertThat(violations("""
                CREATE TABLE authoring.page_tags (page_id uuid REFERENCES authoring.pages(id) ON DELETE CASCADE);
                ALTER TABLE ONLY hosting.search_settings ADD FOREIGN KEY(site_id)
                    REFERENCES hosting.sites(id) ON UPDATE SET NULL;
                ALTER TABLE authoring.collection_spaces ADD FOREIGN KEY(space_id)
                    REFERENCES authoring.spaces(id) ON DELETE SET DEFAULT;
                ALTER TABLE releases.release_pages ADD FOREIGN KEY(release_id)
                    REFERENCES releases.releases(id) ON DELETE CASCADE;
                ALTER TABLE hosting.site_mounts ADD FOREIGN KEY(space_id) REFERENCES authoring.spaces(id);
                """))
                .containsExactly(
                        "authoring.page_tags -> authoring.pages",
                        "hosting.search_settings -> hosting.sites",
                        "authoring.collection_spaces -> authoring.spaces");
    }

    private static List<String> violations(String sql) {
        var result = new ArrayList<String>();
        var tables = TABLE.matcher(sql.replaceAll("(?m)--.*$", "").toLowerCase(java.util.Locale.ROOT));
        while (tables.find()) {
            String child = tables.group(1);
            if (child.startsWith("shared.")) continue;
            var refs = REFERENCE.matcher(tables.group(2));
            while (refs.find()) {
                String parent = refs.group(1);
                if (MUTATION.matcher(refs.group(2)).find()
                        && OWNED_TABLES.stream().noneMatch(owned -> owned.contains(child) && owned.contains(parent))) {
                    result.add(child + " -> " + parent);
                }
            }
        }
        return result;
    }
}
