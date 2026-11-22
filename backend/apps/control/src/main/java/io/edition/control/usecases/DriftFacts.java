package io.edition.control.usecases;

import io.edition.control.modules.release.api.ReleaseApi;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** live vs 最近一次已 promote 的 import 快照。尚无 import 时漂移为空。 */
@Component
public class DriftFacts {
    private final ReleaseApi releases;

    DriftFacts(ReleaseApi releases) {
        this.releases = releases;
    }

    public Board board(UUID space) {
        List<Item> items = items(space);
        return new Board(items.size(), items);
    }

    public List<Item> items(UUID space) {
        Optional<ReleaseApi.Bundle> last = lastPromotedImport(space);
        if (last.isEmpty()) return List.of();
        Optional<ReleaseApi.View> live = releases.live(new ReleaseApi.ScopeId(space));
        if (live.isEmpty()) return List.of();
        Optional<ReleaseApi.Bundle> liveBundle =
                releases.export(new ReleaseApi.ReleaseId(live.orElseThrow().id()));
        if (liveBundle.isEmpty()) return List.of();
        Map<UUID, ReleaseApi.PageSnapshot> imported = last.orElseThrow().pages().stream()
                .collect(Collectors.toMap(ReleaseApi.PageSnapshot::pageId, page -> page, (a, b) -> a));
        List<Item> items = new ArrayList<>();
        for (ReleaseApi.PageSnapshot page : liveBundle.orElseThrow().pages()) {
            ReleaseApi.PageSnapshot baseline = imported.get(page.pageId());
            if (baseline == null
                    || !ReleaseApi.contentFingerprint(page.content())
                            .equals(ReleaseApi.contentFingerprint(baseline.content()))) {
                items.add(new Item(page.pageId(), page.slug(), page.title(), page.externalId()));
            }
        }
        return List.copyOf(items);
    }

    public Set<UUID> pageIds(UUID space) {
        return items(space).stream().map(Item::pageId).collect(Collectors.toUnmodifiableSet());
    }

    public boolean flagged(UUID space, UUID pageId) {
        return pageIds(space).contains(pageId);
    }

    public int size(UUID space) {
        return items(space).size();
    }

    public Optional<ReleaseApi.Bundle> lastPromotedImport(UUID space) {
        return lastPromotedImportView(space).flatMap(view -> releases.export(new ReleaseApi.ReleaseId(view.id())));
    }

    public Optional<ReleaseApi.View> lastPromotedImportView(UUID space) {
        return releases.list(new ReleaseApi.ScopeId(space)).stream()
                .filter(item -> item.source().kind() == ReleaseApi.SourceKind.IMPORT)
                .filter(item -> item.status() == ReleaseApi.Status.LIVE || item.status() == ReleaseApi.Status.ARCHIVED)
                .max(Comparator.comparing(ReleaseApi.View::promotedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(ReleaseApi.View::createdAt));
    }

    public List<ReleaseApi.CoverageWarning> coverageWarnings(UUID space, Set<String> bundleExternalIds) {
        Optional<ReleaseApi.Bundle> last = lastPromotedImport(space);
        if (last.isEmpty()) return List.of();
        Optional<ReleaseApi.View> live = releases.live(new ReleaseApi.ScopeId(space));
        if (live.isEmpty()) return List.of();
        Optional<ReleaseApi.Bundle> liveBundle =
                releases.export(new ReleaseApi.ReleaseId(live.orElseThrow().id()));
        if (liveBundle.isEmpty()) return List.of();
        Map<UUID, ReleaseApi.PageSnapshot> livePages = liveBundle.orElseThrow().pages().stream()
                .collect(Collectors.toMap(ReleaseApi.PageSnapshot::pageId, page -> page, (a, b) -> a));
        List<ReleaseApi.CoverageWarning> warnings = new ArrayList<>();
        for (ReleaseApi.PageSnapshot imported : last.orElseThrow().pages()) {
            if (imported.externalId() == null || !bundleExternalIds.contains(imported.externalId())) continue;
            ReleaseApi.PageSnapshot current = livePages.get(imported.pageId());
            if (current != null
                    && !ReleaseApi.contentFingerprint(current.content())
                            .equals(ReleaseApi.contentFingerprint(imported.content()))) {
                warnings.add(new ReleaseApi.CoverageWarning(imported.pageId(), imported.externalId()));
            }
        }
        return List.copyOf(warnings);
    }

    public boolean hasFlaggedImport(UUID space) {
        return releases.list(new ReleaseApi.ScopeId(space)).stream()
                .anyMatch(item -> item.source().kind() == ReleaseApi.SourceKind.IMPORT
                        && item.status() == ReleaseApi.Status.FLAGGED);
    }

    public record Board(int driftCount, List<Item> items) {
        public Board {
            items = items == null ? List.of() : List.copyOf(items);
        }
    }

    public record Item(UUID pageId, String slug, String title, String externalId) {}
}
