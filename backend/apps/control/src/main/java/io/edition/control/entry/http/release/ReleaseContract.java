package io.edition.control.entry.http.release;

import com.fasterxml.jackson.annotation.JsonValue;
import io.edition.control.compositions.releases.release.ReleaseTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** 发版端点的 OpenAPI 形态。 */
final class ReleaseContract {
    private ReleaseContract() {}

    enum Status {
        DRAFT,
        FLAGGED,
        VALIDATED,
        LIVE,
        ARCHIVED;

        @JsonValue
        public String value() {
            return name().toLowerCase(Locale.ROOT);
        }
    }

    private static Set<String> actions(Set<ReleaseTypes.Action> actions) {
        return actions.stream().map(ReleaseTypes.Action::value).collect(Collectors.toSet());
    }

    @Schema(name = "ReleasePage")
    record PageResponse(List<SummaryResponse> items, String nextCursor, Long total, Set<String> allowedActions) {
        static PageResponse from(ReleaseTypes.ReleasePage value) {
            return new PageResponse(
                    value.items().stream().map(SummaryResponse::from).toList(),
                    value.nextCursor(),
                    value.total(),
                    actions(value.allowedActions()));
        }
    }

    @Schema(name = "ReleaseSummary")
    record SummaryResponse(
            UUID id,
            String label,
            Status status,
            ReleaseTypes.ReleaseSource source,
            int pageCount,
            Instant createdAt,
            Instant promotedAt,
            Set<String> allowedActions) {
        static SummaryResponse from(ReleaseTypes.ReleaseSummary value) {
            return new SummaryResponse(
                    value.id(),
                    value.label(),
                    Status.valueOf(value.status().toUpperCase(Locale.ROOT)),
                    value.source(),
                    value.pageCount(),
                    value.createdAt(),
                    value.promotedAt(),
                    actions(value.allowedActions()));
        }
    }

    @Schema(name = "TenantReleasePage")
    record TenantPageResponse(
            List<TenantSummaryResponse> items, String nextCursor, Long total, List<SpaceChoiceResponse> spaces) {
        static TenantPageResponse from(ReleaseTypes.TenantReleasePage value) {
            return new TenantPageResponse(
                    value.items().stream().map(TenantSummaryResponse::from).toList(),
                    value.nextCursor(),
                    value.total(),
                    value.spaces().stream().map(SpaceChoiceResponse::from).toList());
        }
    }

    @Schema(name = "TenantReleaseSummary")
    record TenantSummaryResponse(
            UUID id,
            String label,
            Status status,
            ReleaseTypes.ReleaseSource source,
            int pageCount,
            Instant createdAt,
            Instant promotedAt,
            Set<String> allowedActions,
            UUID spaceId,
            String spaceName,
            String spaceMode,
            String spaceStatus) {
        static TenantSummaryResponse from(ReleaseTypes.TenantReleaseSummary value) {
            return new TenantSummaryResponse(
                    value.id(),
                    value.label(),
                    Status.valueOf(value.status().toUpperCase(Locale.ROOT)),
                    value.source(),
                    value.pageCount(),
                    value.createdAt(),
                    value.promotedAt(),
                    actions(value.allowedActions()),
                    value.spaceId(),
                    value.spaceName(),
                    value.spaceMode(),
                    value.spaceStatus());
        }
    }

    @Schema(name = "ReleaseSpaceChoice")
    record SpaceChoiceResponse(UUID id, String name, String mode, String status) {
        static SpaceChoiceResponse from(ReleaseTypes.ReleaseSpaceChoice value) {
            return new SpaceChoiceResponse(value.id(), value.name(), value.mode(), value.status());
        }
    }

    @Schema(name = "ReleaseDetail")
    record DetailResponse(
            UUID id,
            String label,
            Status status,
            ReleaseTypes.ReleaseSource source,
            int pageCount,
            Instant createdAt,
            Instant promotedAt,
            Set<String> allowedActions,
            String notes,
            ReleaseTypes.ReportView report,
            ReleaseTypes.DiffSummary diffSummary,
            Long size) {
        static DetailResponse from(ReleaseTypes.ReleaseDetail value) {
            return new DetailResponse(
                    value.id(),
                    value.label(),
                    Status.valueOf(value.status().toUpperCase(Locale.ROOT)),
                    value.source(),
                    value.pageCount(),
                    value.createdAt(),
                    value.promotedAt(),
                    actions(value.allowedActions()),
                    value.notes(),
                    value.report(),
                    value.diffSummary(),
                    value.size());
        }
    }

    @Schema(name = "BuildReleaseResult")
    record BuildResponse(ReleaseTypes.Outcome outcome, DetailResponse release) {
        static BuildResponse from(ReleaseTypes.BuildResult value) {
            return new BuildResponse(
                    value.outcome(), value.release() == null ? null : DetailResponse.from(value.release()));
        }
    }

    @Schema(name = "ReleaseDelta")
    record DeltaResponse(Set<UUID> added, Set<UUID> changed, Set<UUID> removed) {
        static DeltaResponse from(ReleaseTypes.DeltaView value) {
            return new DeltaResponse(value.added(), value.changed(), value.removed());
        }
    }
}
