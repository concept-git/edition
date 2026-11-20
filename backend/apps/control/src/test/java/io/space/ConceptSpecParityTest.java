package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.collection.api.CollectionApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.revision.api.RevisionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tag.api.TagApi;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.toc.api.TocApi;
import io.space.concepts.user.api.UserApi;
import java.io.IOException;
import java.lang.reflect.Modifier;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/** Public concept interface -> CONCEPT action direction of the semantic drift guard. */
class ConceptSpecParityTest {
    private static final Path ROOT = SourceLayout.BACKEND.resolve("libraries");
    private static final Map<Class<?>, String> SPECS = Map.ofEntries(
            Map.entry(UserApi.class, "user/CONCEPT.md"),
            Map.entry(PasswordApi.class, "password/CONCEPT.md"),
            Map.entry(SessionApi.class, "session/CONCEPT.md"),
            Map.entry(ApiTokenApi.class, "api-token/CONCEPT.md"),
            Map.entry(io.space.concepts.managementtoken.api.ManagementTokenApi.class, "management-token/CONCEPT.md"),
            Map.entry(TeamApi.class, "team/CONCEPT.md"),
            Map.entry(MembershipApi.class, "membership/CONCEPT.md"),
            Map.entry(PermissionApi.class, "permission/CONCEPT.md"),
            Map.entry(SpaceApi.class, "space/CONCEPT.md"),
            Map.entry(PageApi.class, "page/CONCEPT.md"),
            Map.entry(RevisionApi.class, "revision/CONCEPT.md"),
            Map.entry(TocApi.class, "toc/CONCEPT.md"),
            Map.entry(TagApi.class, "tag/CONCEPT.md"),
            Map.entry(CollectionApi.class, "collection/CONCEPT.md"),
            Map.entry(ReleaseApi.class, "release/CONCEPT.md"),
            Map.entry(io.space.concepts.site.api.SiteApi.class, "site/CONCEPT.md"),
            Map.entry(io.space.concepts.search.api.SearchApi.class, "search/CONCEPT.md"),
            Map.entry(io.space.concepts.redirect.api.RedirectApi.class, "redirect/CONCEPT.md"),
            Map.entry(io.space.concepts.customdomain.api.CustomDomainApi.class, "custom-domain/CONCEPT.md"));
    private static final Map<String, String> ALIASES = Map.of(
            key(MembershipApi.class, "inviteOf"), "invite",
            key(RevisionApi.class, "detail"), "content",
            key(RevisionApi.class, "page"), "list");

    @Test
    void everyPublicConceptMethodIsDeclaredAsAnActionOrQuery() throws IOException {
        var missing = new LinkedHashMap<String, String>();
        for (var entry : SPECS.entrySet()) {
            String spec = Files.readString(ROOT.resolve(entry.getValue()));
            for (var method : entry.getKey().getDeclaredMethods()) {
                if (!Modifier.isPublic(method.getModifiers()) || Modifier.isStatic(method.getModifiers())) continue;
                String expected = ALIASES.getOrDefault(key(entry.getKey(), method.getName()), method.getName());
                var declared = Pattern.compile("(?m)^_?" + Pattern.quote(expected) + "\\s*[\\(\\[][^\\n]*(?:=>|: \\()")
                        .matcher(spec)
                        .find();
                if (!declared) missing.put(entry.getKey().getSimpleName() + "." + method.getName(), entry.getValue());
            }
        }
        assertThat(missing).as("公开 concept interface 必须在同模块 CONCEPT.md 声明").isEmpty();
    }

    private static String key(Class<?> type, String method) {
        return type.getName() + "#" + method;
    }
}
