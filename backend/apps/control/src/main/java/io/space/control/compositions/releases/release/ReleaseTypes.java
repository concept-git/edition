package io.space.control.compositions.releases.release;

import static io.space.control.compositions.releases.release.ReleaseTypes.*;

import com.fasterxml.jackson.annotation.JsonValue;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.authoring.pageediting.PageEditingTypes;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class ReleaseTypes {
    private ReleaseTypes() {}

    public enum Outcome {
        PROMOTED("promoted"),
        SKIPPED("skipped"),
        HELD("held"),
        UNCHANGED("unchanged");
        private final String value;

        Outcome(String value) {
            this.value = value;
        }

        @JsonValue
        public String value() {
            return value;
        }
    }

    public enum Action {
        BUILD("build"),
        SET_RETENTION("setRetention"),
        DISCARD("discard"),
        ROLLBACK("rollback"),
        PROMOTE("promote"),
        ANNOTATE("annotate"),
        IMPORT("import"),
        APPROVE("approve"),
        EXPORT("export");
        private final String value;

        Action(String value) {
            this.value = value;
        }

        @JsonValue
        public String value() {
            return value;
        }
    }

    public record PipelineResult(Outcome outcome, ReleaseApi.View release) {}

    public record PublishResult(PageEditingTypes.PageDetail page, Outcome outcome, ReleaseDetail release) {}

    public record BuildResult(Outcome outcome, ReleaseDetail release) {}

    public record BatchPublishResult(
            List<PageEditingTypes.PageSummary> pages, Outcome outcome, ReleaseDetail release) {}

    public record ReleasePatch(boolean labelPresent, String label, boolean notesPresent, String notes) {
        boolean empty() {
            return !labelPresent && !notesPresent;
        }

        String canonical() {
            return IdempotentFlowExecutor.canonical(
                    labelPresent ? "set:" + label : "unchanged", notesPresent ? "set:" + notes : "unchanged");
        }

        public static ReleasePatch fromJson(boolean labelPresent, String label, boolean notesPresent, String notes) {
            return new ReleasePatch(labelPresent, label, notesPresent, notes);
        }
    }

    public record ReleaseSource(String kind, String ref, UUID actor) {}

    public record DiffSummary(int added, int changed, int removed) {}

    public record IssueView(String code, String path, UUID pageId, String detail) {}

    public record ReportView(List<IssueView> errors, List<IssueView> warnings, List<IssueView> info) {
        public ReportView {
            errors = errors == null ? List.of() : List.copyOf(errors);
            warnings = warnings == null ? List.of() : List.copyOf(warnings);
            info = info == null ? List.of() : List.copyOf(info);
        }
    }

    public record ReleaseSummary(
            UUID id,
            String label,
            String status,
            ReleaseSource source,
            int pageCount,
            Instant createdAt,
            Instant promotedAt,
            Set<Action> allowedActions) {
        public ReleaseSummary {
            allowedActions = allowedActions == null ? Set.of() : Set.copyOf(allowedActions);
        }
    }

    public record ReleaseDetail(
            UUID id,
            String label,
            String status,
            ReleaseSource source,
            int pageCount,
            Instant createdAt,
            Instant promotedAt,
            Set<Action> allowedActions,
            String notes,
            ReportView report,
            DiffSummary diffSummary,
            Long size) {
        public ReleaseDetail {
            allowedActions = allowedActions == null ? Set.of() : Set.copyOf(allowedActions);
        }
    }

    public record ReleasePage(List<ReleaseSummary> items, String nextCursor, Long total, Set<Action> allowedActions) {
        public ReleasePage {
            items = items == null ? List.of() : List.copyOf(items);
            allowedActions = allowedActions == null ? Set.of() : Set.copyOf(allowedActions);
        }
    }

    public record TenantReleaseFilter(
            java.util.Optional<UUID> space,
            java.util.Optional<SpaceApi.Mode> mode,
            java.util.Optional<ReleaseApi.Status> status) {
        public TenantReleaseFilter {
            space = space == null ? java.util.Optional.empty() : space;
            mode = mode == null ? java.util.Optional.empty() : mode;
            status = status == null ? java.util.Optional.empty() : status;
        }

        public static TenantReleaseFilter parse(UUID space, String mode, String status) {
            return new TenantReleaseFilter(
                    java.util.Optional.ofNullable(space),
                    TenantReleaseListing.mode(mode),
                    TenantReleaseListing.status(status));
        }
    }

    public record TenantReleaseSummary(
            UUID id,
            String label,
            String status,
            ReleaseSource source,
            int pageCount,
            Instant createdAt,
            Instant promotedAt,
            Set<Action> allowedActions,
            UUID spaceId,
            String spaceName,
            String spaceMode,
            String spaceStatus) {
        public TenantReleaseSummary {
            allowedActions = allowedActions == null ? Set.of() : Set.copyOf(allowedActions);
        }
    }

    public record ReleaseSpaceChoice(UUID id, String name, String mode, String status) {}

    public record TenantReleasePage(
            List<TenantReleaseSummary> items, String nextCursor, Long total, List<ReleaseSpaceChoice> spaces) {
        public TenantReleasePage {
            items = items == null ? List.of() : List.copyOf(items);
            spaces = spaces == null ? List.of() : List.copyOf(spaces);
        }
    }

    public record DeltaView(Set<UUID> added, Set<UUID> changed, Set<UUID> removed) {
        public DeltaView {
            added = Set.copyOf(added);
            changed = Set.copyOf(changed);
            removed = Set.copyOf(removed);
        }
    }
}
