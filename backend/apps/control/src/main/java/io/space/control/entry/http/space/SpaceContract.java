package io.space.control.entry.http.space;

import io.space.control.compositions.authoring.space.SpaceTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class SpaceContract {
    private SpaceContract() {}

    @Schema(name = "SpacePage")
    record PageResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<SummaryResponse> items,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String nextCursor,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            Long total,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<SpaceTypes.Action> allowedActions) {
        static PageResponse from(SpaceTypes.SpacePage page) {
            return new PageResponse(
                    page.items().stream().map(SummaryResponse::from).toList(),
                    page.nextCursor(),
                    page.total(),
                    page.allowedActions());
        }
    }

    @Schema(name = "SpaceSummary")
    record SummaryResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID id,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID tenantId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String name,

            @Schema(
                    requiredMode = Schema.RequiredMode.REQUIRED,
                    nullable = true,
                    allowableValues = {"book", "code", "api", "guide", "reference"})
            String icon,

            @Schema(
                    requiredMode = Schema.RequiredMode.REQUIRED,
                    allowableValues = {"authored", "synced"})
            String mode,

            @Schema(
                    requiredMode = Schema.RequiredMode.REQUIRED,
                    allowableValues = {"active", "archived"})
            String status,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            long pageCount,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            long driftCount,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            Instant lastReleaseAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            Instant createdAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID createdBy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            Instant updatedAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID updatedBy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID collectionId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<SpaceTypes.Action> allowedActions) {
        static SummaryResponse from(SpaceTypes.SpaceSummary value) {
            return new SummaryResponse(
                    value.id(),
                    value.tenantId(),
                    value.name(),
                    value.icon(),
                    value.mode(),
                    value.status(),
                    value.pageCount(),
                    value.driftCount(),
                    value.lastReleaseAt(),
                    value.createdAt(),
                    value.createdBy(),
                    value.updatedAt(),
                    value.updatedBy(),
                    value.collectionId(),
                    value.allowedActions());
        }
    }

    @Schema(name = "SpaceDetail")
    public record DetailResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID id,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID tenantId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String name,

            @Schema(
                    requiredMode = Schema.RequiredMode.REQUIRED,
                    nullable = true,
                    allowableValues = {"book", "code", "api", "guide", "reference"})
            String icon,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String description,

            @Schema(
                    requiredMode = Schema.RequiredMode.REQUIRED,
                    allowableValues = {"authored", "synced"})
            String mode,

            @Schema(
                    requiredMode = Schema.RequiredMode.REQUIRED,
                    allowableValues = {"active", "archived"})
            String status,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            long pageCount,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            long driftCount,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            Instant lastReleaseAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            Instant createdAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID createdBy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            Instant updatedAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID updatedBy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID collectionId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<SpaceTypes.Action> allowedActions,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<String> collectionPath,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<MountResponse> mounts,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            int retention,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            Boolean autoRelease) {
        static DetailResponse from(SpaceTypes.SpaceDetail value) {
            return new DetailResponse(
                    value.id(),
                    value.tenantId(),
                    value.name(),
                    value.icon(),
                    value.description(),
                    value.mode(),
                    value.status(),
                    value.pageCount(),
                    value.driftCount(),
                    value.lastReleaseAt(),
                    value.createdAt(),
                    value.createdBy(),
                    value.updatedAt(),
                    value.updatedBy(),
                    value.collectionId(),
                    value.allowedActions(),
                    value.collectionPath(),
                    value.mounts().stream().map(MountResponse::from).toList(),
                    value.retention(),
                    value.autoRelease());
        }
    }

    @Schema(name = "SpaceMount")
    record MountResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID siteId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String slug) {
        static MountResponse from(SpaceTypes.Mount value) {
            return new MountResponse(value.siteId(), value.slug());
        }
    }
}
