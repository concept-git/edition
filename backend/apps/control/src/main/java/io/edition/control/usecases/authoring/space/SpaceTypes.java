package io.edition.control.usecases.authoring.space;

import static io.edition.control.usecases.authoring.space.SpaceTypes.*;

import com.fasterxml.jackson.annotation.JsonValue;
import io.edition.control.modules.space.api.SpaceApi;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class SpaceTypes {
    private SpaceTypes() {}

    public record UpdatePatch(
            SpaceApi.Patch<String> name,
            SpaceApi.Patch<String> icon,
            SpaceApi.Patch<String> description,
            java.util.Optional<Boolean> autoRelease) {
        public UpdatePatch {
            name = name == null ? SpaceApi.Patch.unchanged() : name;
            icon = icon == null ? SpaceApi.Patch.unchanged() : icon;
            description = description == null ? SpaceApi.Patch.unchanged() : description;
            autoRelease = autoRelease == null ? java.util.Optional.empty() : autoRelease;
        }

        boolean empty() {
            return name instanceof SpaceApi.Patch.Unchanged<?>
                    && icon instanceof SpaceApi.Patch.Unchanged<?>
                    && description instanceof SpaceApi.Patch.Unchanged<?>
                    && autoRelease.isEmpty();
        }

        public static UpdatePatch fromJson(
                boolean namePresent,
                String name,
                boolean iconPresent,
                String icon,
                boolean descriptionPresent,
                String description,
                boolean autoReleasePresent,
                Boolean autoRelease) {
            if (autoReleasePresent && autoRelease == null) {
                throw new SpacePatchInvalidException("autoRelease", "required");
            }
            return new UpdatePatch(
                    field(namePresent, name),
                    field(iconPresent, icon),
                    field(descriptionPresent, description),
                    autoReleasePresent ? java.util.Optional.of(autoRelease) : java.util.Optional.empty());
        }

        private static SpaceApi.Patch<String> field(boolean present, String value) {
            if (!present) return SpaceApi.Patch.unchanged();
            return value == null ? SpaceApi.Patch.clear() : SpaceApi.Patch.set(value);
        }
    }

    public record SpacePage(List<SpaceSummary> items, String nextCursor, Long total, List<Action> allowedActions) {
        public SpacePage {
            items = List.copyOf(items);
            allowedActions = List.copyOf(allowedActions);
        }
    }

    public record SpaceSummary(
            UUID id,
            UUID tenantId,
            String name,
            String icon,
            String mode,
            String status,
            long pageCount,
            long driftCount,
            Instant lastReleaseAt,
            Instant createdAt,
            UUID createdBy,
            Instant updatedAt,
            UUID updatedBy,
            UUID collectionId,
            List<Action> allowedActions) {}

    public record SpaceDetail(
            UUID id,
            UUID tenantId,
            String name,
            String icon,
            String description,
            String mode,
            String status,
            long pageCount,
            long driftCount,
            Instant lastReleaseAt,
            Instant createdAt,
            UUID createdBy,
            Instant updatedAt,
            UUID updatedBy,
            UUID collectionId,
            List<Action> allowedActions,
            List<String> collectionPath,
            List<Mount> mounts,
            int mountCount,
            int retention,
            Boolean autoRelease) {}

    public record Mount(UUID siteId, String slug) {}

    public enum Action {
        DELETE("delete"),
        CREATE("create"),
        READ("read"),
        UPDATE("update"),
        ARCHIVE("archive"),
        RESTORE("restore"),
        CONVERT("convert"),
        WRITE_PAGES("write_pages"),
        MANAGE_PERMISSIONS("manage_permissions");
        private final String value;

        Action(String value) {
            this.value = value;
        }

        @JsonValue
        public String value() {
            return value;
        }
    }
}
