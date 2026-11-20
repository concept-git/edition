package io.space.control.compositions.releases.bundleimport;

import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.release.api.ReleaseApi;
import io.space.control.compositions.DriftFacts;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** 按最近一次已 promote 的 import 快照（否则 live）把 externalId 映到 pageId。 */
@Component
class ImportPageIds {
    private final ReleaseApi releases;
    private final DriftFacts drift;

    ImportPageIds(ReleaseApi releases, DriftFacts drift) {
        this.releases = releases;
        this.drift = drift;
    }

    Assignment assign(UUID space, List<AdaptedPack.Page> pages) {
        Optional<ReleaseApi.Bundle> baseline = drift.lastPromotedImport(space);
        if (baseline.isEmpty()) {
            baseline = releases.live(new ReleaseApi.ScopeId(space))
                    .flatMap(live -> releases.export(new ReleaseApi.ReleaseId(live.id())));
        }
        Map<String, ReleaseApi.PageSnapshot> byExternal = new HashMap<>();
        Set<UUID> previous = new HashSet<>();
        baseline.ifPresent(bundle -> {
            for (ReleaseApi.PageSnapshot page : bundle.pages()) {
                if (page.externalId() != null) byExternal.put(page.externalId(), page);
                previous.add(page.pageId());
            }
        });
        Map<String, UUID> ids = new HashMap<>();
        Set<UUID> kept = new HashSet<>();
        List<FormatShift> formatChanges = new ArrayList<>();
        for (AdaptedPack.Page page : pages) {
            ReleaseApi.PageSnapshot existing = byExternal.get(page.externalId());
            UUID pageId;
            if (existing != null) {
                pageId = existing.pageId();
                String previousFormat = existing.format().name().toLowerCase(Locale.ROOT);
                if (!previousFormat.equals(page.format().toLowerCase(Locale.ROOT))) {
                    formatChanges.add(new FormatShift(
                            pageId,
                            page.externalId(),
                            previousFormat,
                            page.format().toLowerCase(Locale.ROOT)));
                }
            } else {
                pageId = UUID.randomUUID();
            }
            ids.put(page.externalId(), pageId);
            kept.add(pageId);
        }
        Set<UUID> trash = new HashSet<>(previous);
        trash.removeAll(kept);
        return new Assignment(Map.copyOf(ids), Set.copyOf(trash), List.copyOf(formatChanges));
    }

    record FormatShift(UUID pageId, String externalId, String previous, String next) {}

    record Assignment(Map<String, UUID> pageIds, Set<UUID> trash, List<FormatShift> formatChanges) {
        Assignment {
            pageIds = pageIds == null ? Map.of() : Map.copyOf(pageIds);
            trash = trash == null ? Set.of() : Set.copyOf(trash);
            formatChanges = formatChanges == null ? List.of() : List.copyOf(formatChanges);
        }
    }
}
