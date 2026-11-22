package io.edition.control.adapters.inbound.http.toc;

import io.edition.control.usecases.authoring.tocediting.TocEditingTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** 目录端点的 OpenAPI 形态：flow 记录 → 契约 DTO；allowedActions 以线值字符串暴露。 */
final class TocContract {
    private TocContract() {}

    private static Set<String> actions(Set<TocEditingTypes.Action> actions) {
        return actions.stream().map(TocEditingTypes.Action::value).collect(Collectors.toSet());
    }

    @Schema(name = "TocView")
    record TocResponse(List<EntryResponse> entries, Set<String> allowedActions) {
        static TocResponse from(TocEditingTypes.TocView value) {
            return new TocResponse(
                    value.entries().stream().map(EntryResponse::from).toList(), actions(value.allowedActions()));
        }
    }

    @Schema(name = "TocEntry")
    record EntryResponse(
            UUID id,
            UUID parentId,
            int position,
            String label,
            String kind,
            UUID targetId,
            String url,
            int depth,
            List<EntryResponse> children) {
        static EntryResponse from(TocEditingTypes.EntryView value) {
            return new EntryResponse(
                    value.id(),
                    value.parentId(),
                    value.position(),
                    value.label(),
                    value.kind(),
                    value.targetId(),
                    value.url(),
                    value.depth(),
                    value.children().stream().map(EntryResponse::from).toList());
        }
    }
}
