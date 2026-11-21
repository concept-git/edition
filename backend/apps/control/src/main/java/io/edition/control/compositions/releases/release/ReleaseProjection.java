package io.edition.control.compositions.releases.release;

import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** Release 概念视图 → flow 响应。 */
@Component
public class ReleaseProjection {
    private final ReleaseApi releases;
    private final ReleaseAccess access;

    ReleaseProjection(ReleaseApi releases, ReleaseAccess access) {
        this.releases = releases;
        this.access = access;
    }

    ReleaseTypes.ReleasePage page(
            List<ReleaseApi.View> items, String nextCursor, Resolution resolution, UUID tenant, SpaceApi.View space) {
        List<ReleaseTypes.ReleaseSummary> summaries = new ArrayList<>(items.size());
        for (ReleaseApi.View item : items) {
            summaries.add(summary(item, resolution, tenant, space));
        }
        return new ReleaseTypes.ReleasePage(
                summaries, nextCursor, null, access.collectionActions(resolution, tenant, space));
    }

    ReleaseTypes.ReleaseSummary summary(
            ReleaseApi.View release, Resolution resolution, UUID tenant, SpaceApi.View space) {
        return new ReleaseTypes.ReleaseSummary(
                release.id(),
                release.label(),
                stored(release.status()),
                source(release.source()),
                release.pageCount(),
                release.createdAt(),
                release.promotedAt(),
                access.itemActions(resolution, tenant, space, release));
    }

    public ReleaseTypes.ReleaseDetail detail(
            ReleaseApi.View release, Resolution resolution, UUID tenant, SpaceApi.View space) {
        return new ReleaseTypes.ReleaseDetail(
                release.id(),
                release.label(),
                stored(release.status()),
                source(release.source()),
                release.pageCount(),
                release.createdAt(),
                release.promotedAt(),
                access.itemActions(resolution, tenant, space, release),
                release.notes(),
                report(release.report()),
                diffSummary(space.id(), release),
                null);
    }

    ReleaseTypes.DeltaView delta(ReleaseApi.Delta delta) {
        return new ReleaseTypes.DeltaView(delta.added(), delta.changed(), delta.removed());
    }

    private ReleaseTypes.DiffSummary diffSummary(UUID space, ReleaseApi.View candidate) {
        Optional<ReleaseApi.View> live = releases.live(new ReleaseApi.ScopeId(space));
        if (live.isEmpty()) {
            return new ReleaseTypes.DiffSummary(candidate.pageCount(), 0, 0);
        }
        if (live.orElseThrow().id().equals(candidate.id())) {
            return new ReleaseTypes.DiffSummary(0, 0, 0);
        }
        ReleaseApi.Delta delta = releases.diff(
                        new ReleaseApi.ReleaseId(live.orElseThrow().id()), new ReleaseApi.ReleaseId(candidate.id()))
                .orElseThrow(ReleaseNotFoundException::new);
        return new ReleaseTypes.DiffSummary(
                delta.added().size(), delta.changed().size(), delta.removed().size());
    }

    private static ReleaseTypes.ReleaseSource source(ReleaseApi.Source source) {
        return new ReleaseTypes.ReleaseSource(
                source.kind().name().toLowerCase(Locale.ROOT), source.ref(), source.actor());
    }

    private static ReleaseTypes.ReportView report(ReleaseApi.Report report) {
        return new ReleaseTypes.ReportView(issues(report.errors()), issues(report.warnings()), issues(report.info()));
    }

    private static List<ReleaseTypes.IssueView> issues(List<ReleaseApi.Issue> issues) {
        return issues.stream()
                .map(issue -> new ReleaseTypes.IssueView(issue.code(), issue.path(), issue.pageId(), issue.detail()))
                .toList();
    }

    private static String stored(Enum<?> value) {
        return value.name().toLowerCase(Locale.ROOT);
    }
}
