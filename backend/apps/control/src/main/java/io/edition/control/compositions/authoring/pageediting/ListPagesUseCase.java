package io.edition.control.compositions.authoring.pageediting;

import static io.edition.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.tag.api.TagApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import io.edition.control.compositions.resource.PageNotFoundException;
import io.edition.control.compositions.resource.ResourceChain;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListPagesUseCase {
    private final PageEditingRelay relay;

    private final PageApi pages;

    private final SpaceApi spaces;
    private final TagApi tags;
    private final TenantAccess tenants;
    private final ResourceChain resources;

    private final PageAccess access;
    private final PageProjection projection;

    ListPagesUseCase(PageEditingDependencies dependencies) {
        this.relay = dependencies.relay;
        this.pages = dependencies.pages;
        this.spaces = dependencies.spaces;
        this.tags = dependencies.tags;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public PagePage listPages(
            String credential,
            UUID tenant,
            UUID space,
            String cursor,
            int limit,
            String status,
            String format,
            String tag,
            String q) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            // gateway 已用 @Min/@Max 与 @Pattern 校验 limit/status/format；越界到此属编程错误。
            if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
            SpaceApi.View owner = resources.space(tenant, space).orElseThrow(PageNotFoundException::new);
            var resolution = access.requireListAccess(credential, tenant);
            Optional<PageApi.Status> parsedStatus =
                    Optional.ofNullable(status).map(value -> PageApi.Status.valueOf(value.toUpperCase(Locale.ROOT)));
            Optional<PageApi.Format> parsedFormat =
                    Optional.ofNullable(format).map(value -> PageApi.Format.valueOf(value.toUpperCase(Locale.ROOT)));
            String needle = PageTitleSlugQuery.needle(q);
            Set<UUID> tagged = null;
            if (tag != null && !tag.isBlank()) {
                String parsed =
                        TagApi.parse(tag).orElseThrow(() -> new MetadataInvalidException("tag", "invalid_format"));
                tagged = tenants.inTenant(tenant, () -> tags.byLabel(parsed));
                if (tagged.isEmpty()) {
                    return new PagePage(List.of(), null, null, access.listActions(resolution, tenant, owner));
                }
            }
            var visible = new ArrayList<PageSummary>(limit);
            String scanCursor = cursor;
            String next = null;

            // 权限过滤在候选集之后，一批不够就顺着游标继续扫，直到凑满 limit 或没有下一页。
            while (visible.size() < limit) {
                int remaining = limit - visible.size();
                final String batchCursor = scanCursor;
                final PageApi.Slice batch;
                try {
                    batch = tenants.inTenant(
                            tenant, () -> pages.page(batchCursor, remaining, parsedStatus, parsedFormat));
                } catch (IllegalArgumentException invalid) {
                    throw new InvalidCursorException();
                }
                Set<UUID> candidateIds =
                        batch.items().stream().map(PageApi.View::id).collect(Collectors.toUnmodifiableSet());
                Map<UUID, String> slugs = tenants.inTenant(tenant, () -> spaces.placementsOf(candidateIds)).stream()
                        .filter(placement -> placement.space().value().equals(space))
                        .collect(Collectors.toUnmodifiableMap(SpaceApi.Placement::item, SpaceApi.Placement::slug));
                Set<UUID> inSpace = slugs.keySet();
                if (tagged != null) {
                    inSpace = inSpace.stream().filter(tagged::contains).collect(Collectors.toUnmodifiableSet());
                }
                if (needle != null) {
                    Map<UUID, PageApi.View> byId = batch.items().stream()
                            .collect(Collectors.toUnmodifiableMap(PageApi.View::id, page -> page));
                    inSpace = inSpace.stream()
                            .filter(id -> PageTitleSlugQuery.matches(byId.get(id), slugs.get(id), needle))
                            .collect(Collectors.toUnmodifiableSet());
                }
                Set<UUID> readable = access.readable(resolution, tenant, space, inSpace);
                List<PageApi.View> accepted = batch.items().stream()
                        .filter(page -> readable.contains(page.id()))
                        .toList();
                Set<UUID> acceptedIds = accepted.stream().map(PageApi.View::id).collect(Collectors.toUnmodifiableSet());
                Map<UUID, List<String>> pageTags = tenants.inTenant(tenant, () -> tags.labelsOf(acceptedIds));
                Set<UUID> drifted = tenants.inTenant(tenant, () -> projection.driftedPages(space));
                accepted.stream()
                        .map(page -> projection.summary(
                                page,
                                slugs.get(page.id()),
                                resolution,
                                tenant,
                                owner,
                                pageTags.getOrDefault(page.id(), List.of()),
                                drifted.contains(page.id())))
                        .forEach(visible::add);
                next = batch.nextCursor();
                if (next == null || visible.size() >= limit) break;
                scanCursor = next;
            }
            return new PagePage(visible, next, null, access.listActions(resolution, tenant, owner));
        }
    }

    @Transactional(readOnly = true)
    public PagePage listPages(
            String credential,
            UUID tenant,
            UUID space,
            String cursor,
            int limit,
            String status,
            String format,
            String tag,
            String q,
            List<UUID> ids) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            if (ids == null) return listPages(credential, tenant, space, cursor, limit, status, format, tag, q);
            if (cursor != null || status != null || format != null || tag != null || q != null)
                throw new MetadataInvalidException("ids", "incompatible_filter");
            var batch = relay.batchGetPages(credential, tenant, space, ids, ReadView.SUMMARY);
            var owner = resources.space(tenant, space).orElseThrow(PageNotFoundException::new);
            var resolution = access.requireListAccess(credential, tenant);
            return new PagePage(
                    batch.items().stream()
                            .filter(item -> item.status() == ReadStatus.OK)
                            .map(BatchPage::page)
                            .toList(),
                    null,
                    null,
                    access.listActions(resolution, tenant, owner));
        }
    }
}
