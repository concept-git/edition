package io.space.control.compositions.authoring.tagging;

import static io.space.control.compositions.authoring.tagging.TaggingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tag.api.TagApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.shared.PageWindow;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListTagsUseCase {

    private final TagApi tags;
    private final PageApi pages;
    private final SpaceApi spaces;
    private final TenantAccess tenants;

    private final TagAccess access;

    ListTagsUseCase(TaggingDependencies dependencies) {
        this.tags = dependencies.tags;
        this.pages = dependencies.pages;
        this.spaces = dependencies.spaces;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
    }

    @Transactional(readOnly = true)
    public TagCatalog listTags(String credential, UUID tenant, String q, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Resolution resolution = access.admit(credential, tenant);
        Optional<String> prefix = TagLabels.optionalPrefix(q);
        if (prefix.isEmpty()) {
            return new TagCatalog(List.of(), null, access.catalogActions(resolution, tenant));
        }
        final TagCountCursor.Key after;
        try {
            after = TagCountCursor.decode(cursor).orElse(null);
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
        return tenants.inTenant(tenant, () -> {
            List<TagApi.Match> matches = tags.matching(prefix.get());
            var visible = VisibleTaggedPages.assemble(
                    tags, pages, spaces, access, resolution, tenant, TagProjection.allItems(matches));
            List<TagCount> ranked = matches.stream()
                    .map(match -> new TagCount(
                            match.label(),
                            match.items().stream()
                                    .filter(visible.readable()::contains)
                                    .count()))
                    .filter(count -> count.pageCount() > 0)
                    .sorted(Comparator.comparing(TagCount::pageCount).reversed().thenComparing(TagCount::label))
                    .toList();
            List<TagCount> remaining = after == null
                    ? ranked
                    : ranked.stream()
                            .filter(count -> TagProjection.afterCursor(count, after))
                            .toList();
            var window = PageWindow.of(remaining, limit, row -> TagCountCursor.encode(row.pageCount(), row.label()));
            return new TagCatalog(window.items(), window.nextCursor(), access.catalogActions(resolution, tenant));
        });
    }
}
