package io.edition.control.compositions.authoring.pageediting;

import io.edition.concepts.apitoken.api.ApiTokenApi;
import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.revision.api.RevisionApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.tag.api.TagApi;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.DriftFacts;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.time.Clock;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** 概念视图 → flow 响应记录的投影；actor 墓碑（已注销用户 / 已吊销令牌）在这里统一处理。 */
@Component
public class PageProjection {
    private final RevisionApi revisions;
    private final UserApi users;
    private final ApiTokenApi tokens;
    private final TagApi tags;
    private final PageAccess access;
    private final TenantAccess tenants;
    private final DriftFacts drift;
    private final Clock clock;

    PageProjection(
            RevisionApi revisions,
            UserApi users,
            ApiTokenApi tokens,
            TagApi tags,
            PageAccess access,
            TenantAccess tenants,
            DriftFacts drift,
            Clock clock) {
        this.revisions = revisions;
        this.users = users;
        this.tokens = tokens;
        this.tags = tags;
        this.access = access;
        this.tenants = tenants;
        this.drift = drift;
        this.clock = clock;
    }

    public PageEditingTypes.PageDetail view(String credential, UUID tenant, UUID space, UUID page) {
        var located = access.workingPage(tenant, space, page);
        var resolution = access.require(credential, tenant, space, page, TenantAccess.READ);
        return detail(located.page(), located.slug(), resolution, tenant, located.space());
    }

    public PageEditingTypes.PageSummary summary(
            PageApi.View page, String slug, Resolution resolution, UUID tenant, SpaceApi.View space) {
        return tenants.inTenant(
                tenant,
                () -> summary(
                        page,
                        slug,
                        resolution,
                        tenant,
                        space,
                        tags.labelsOf(new TagApi.ItemId(page.id())),
                        drift.flagged(space.id(), page.id())));
    }

    PageEditingTypes.PageSummary summary(
            PageApi.View page,
            String slug,
            Resolution resolution,
            UUID tenant,
            SpaceApi.View space,
            List<String> tagLabels,
            boolean driftFlag) {
        return new PageEditingTypes.PageSummary(
                page.id(),
                page.title(),
                slug,
                stored(page.status()),
                stored(page.format()),
                page.icon(),
                List.copyOf(tagLabels),
                driftFlag,
                page.updatedAt(),
                page.updatedBy().id(),
                null,
                access.allowedActions(resolution, tenant, space, page),
                page.contentProfile().contentType(),
                page.contentProfile().versionRef(),
                page.contentProfile().interpretation());
    }

    Set<UUID> driftedPages(UUID space) {
        return drift.pageIds(space);
    }

    /**
     * 投影本身还要回查修订数与 actor 元数据，两者都落在受 RLS 保护的租户表上；
     * 因此这里自带租户作用域，调用方不必记得在 inTenant 里拼装响应。
     */
    public PageEditingTypes.PageDetail detail(
            PageApi.View page, String slug, Resolution resolution, UUID tenant, SpaceApi.View space) {
        long words = wordCount(page.content());
        long revisionCount = tenants.inTenant(tenant, () -> revisions.count(new RevisionApi.ItemId(page.id())));
        List<String> tagLabels = tenants.inTenant(tenant, () -> tags.labelsOf(new TagApi.ItemId(page.id())));
        boolean driftFlag = tenants.inTenant(tenant, () -> drift.flagged(space.id(), page.id()));
        return new PageEditingTypes.PageDetail(
                page.id(),
                page.title(),
                slug,
                stored(page.status()),
                stored(page.format()),
                page.icon(),
                tagLabels,
                driftFlag,
                page.updatedAt(),
                page.updatedBy().id(),
                null,
                access.allowedActions(resolution, tenant, space, page),
                page.content(),
                page.revision(),
                seo(page.seo()),
                page.properties(),
                page.attachments().stream().map(PageProjection::attachment).toList(),
                page.trashedAt(),
                revisionCount,
                words,
                words == 0 ? 0 : Math.max(1, (words + 199) / 200),
                page.contentProfile().contentType(),
                page.contentProfile().versionRef(),
                page.contentProfile().interpretation());
    }

    PageEditingTypes.AttachmentLink attachmentLink(
            PageApi.Attachment attachment, String url, java.time.Instant expiresAt) {
        return new PageEditingTypes.AttachmentLink(
                url, expiresAt, attachment.filename(), attachment.mime(), attachment.sizeBytes());
    }

    private static PageEditingTypes.Seo seo(PageApi.Seo seo) {
        return new PageEditingTypes.Seo(seo.title(), seo.description(), seo.keywords(), seo.ogImage(), seo.noIndex());
    }

    private static PageEditingTypes.Attachment attachment(PageApi.Attachment attachment) {
        return new PageEditingTypes.Attachment(
                attachment.ref(),
                attachment.filename(),
                attachment.mime(),
                attachment.sizeBytes(),
                "attachments/" + attachment.storageKey() + "/" + attachment.filename());
    }

    PageEditingTypes.RevisionPage revisions(RevisionApi.Page page) {
        return new PageEditingTypes.RevisionPage(
                page.items().stream().map(this::revision).toList(), page.nextCursor());
    }

    PageEditingTypes.RevisionDetail revision(RevisionApi.Detail detail, PageApi.Format format) {
        var entry = revision(detail.entry());
        var profile = detail.contentProfile() == null
                ? io.edition.content.ContentProfile.defaults(format.name())
                : detail.contentProfile();
        return new PageEditingTypes.RevisionDetail(
                entry.n(),
                entry.actor(),
                entry.createdAt(),
                entry.note(),
                entry.sizeBytes(),
                entry.sizeDelta(),
                detail.content(),
                profile.contentType(),
                profile.versionRef(),
                profile.interpretation());
    }

    PageEditingTypes.RevisionDiff diff(RevisionApi.Diff value) {
        return new PageEditingTypes.RevisionDiff(
                value.from(),
                value.to(),
                value.hunks().stream()
                        .map(hunk -> new PageEditingTypes.DiffHunk(
                                hunk.oldStart(),
                                hunk.oldLines(),
                                hunk.newStart(),
                                hunk.newLines(),
                                hunk.lines().stream()
                                        .map(line -> new PageEditingTypes.DiffLine(
                                                line.type().name().toLowerCase(Locale.ROOT), line.content()))
                                        .toList()))
                        .toList());
    }

    private PageEditingTypes.RevisionEntry revision(RevisionApi.Entry entry) {
        return new PageEditingTypes.RevisionEntry(
                entry.n(), actor(entry.actor()), entry.createdAt(), entry.note(), entry.sizeBytes(), entry.sizeDelta());
    }

    private PageEditingTypes.ActorView actor(RevisionApi.Actor actor) {
        return switch (actor.type()) {
            case SYSTEM -> new PageEditingTypes.ActorView("system", null, "系统", "system");
            case USER ->
                users.accountProfile(new UserApi.UserId(actor.id()))
                        .map(profile -> new PageEditingTypes.ActorView(
                                "user", actor.id(), profile.name(), stored(profile.status())))
                        .orElseGet(() -> new PageEditingTypes.ActorView("user", actor.id(), "已注销用户", "erased"));
            case API_TOKEN ->
                tokens.metadata(new ApiTokenApi.TokenId(actor.id()))
                        .map(token -> new PageEditingTypes.ActorView(
                                "api_token", actor.id(), token.name(), token.status(clock.instant())))
                        .orElseGet(() -> new PageEditingTypes.ActorView("api_token", actor.id(), "已吊销令牌", "revoked"));
        };
    }

    private static long wordCount(String content) {
        String value = content.strip();
        return value.isEmpty() ? 0 : value.split("\\s+").length;
    }

    private static String stored(Enum<?> value) {
        return value.name().toLowerCase(Locale.ROOT);
    }
}
