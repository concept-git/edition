package io.edition.control.usecases.authoring.permission;

import static io.edition.control.usecases.authoring.permission.PermissionTypes.*;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class PermissionTypes {
    private PermissionTypes() {}

    public record GrantPage(
            List<GrantView> items, @Schema(nullable = true) String nextCursor, List<PermissionAction> allowedActions) {
        public GrantPage {
            items = List.copyOf(items);
            allowedActions = List.copyOf(allowedActions);
        }
    }

    public record PrincipalPage(
            List<PrincipalView> items,
            @Schema(nullable = true) String nextCursor) {
        public PrincipalPage {
            items = List.copyOf(items);
        }
    }

    public record PermissionPage(
            List<PagePermissionSummary> items,
            @Schema(nullable = true) String nextCursor) {
        public PermissionPage {
            items = List.copyOf(items);
        }
    }

    public record PagePermissionSummary(
            UUID id,
            String title,
            String slug,
            boolean restrictionActive,
            int restrictionCount,
            List<PermissionAction> allowedActions) {
        public PagePermissionSummary {
            allowedActions = List.copyOf(allowedActions);
        }
    }

    public record PagePermissionView(UUID pageId, RestrictionView restriction, List<PermissionAction> allowedActions) {
        public PagePermissionView {
            allowedActions = List.copyOf(allowedActions);
        }
    }

    public record RestrictionView(boolean active, List<PrincipalView> principals, long revision) {
        public RestrictionView {
            principals = List.copyOf(principals);
        }
    }

    public record EffectivePermissionView(
            PrincipalView principal,
            boolean allowed,
            EffectiveReason reason,
            List<PermissionOperation> effectiveOperations,
            @JsonInclude(JsonInclude.Include.NON_ABSENT) Optional<ResourceView> matchedLayer,
            List<EffectiveGrantView> matchedGrants,
            List<DecisionTraceView> trace) {
        public EffectivePermissionView {
            effectiveOperations = List.copyOf(effectiveOperations);
            matchedLayer = java.util.Objects.requireNonNull(matchedLayer, "matched layer");
            matchedGrants = List.copyOf(matchedGrants);
            trace = List.copyOf(trace);
        }
    }

    public record EffectiveGrantView(ResourceView resource, String principalKey, PermissionRole role) {}

    public record DecisionTraceView(
            ResourceView resource,
            List<EffectiveGrantView> subjectGrants,
            boolean restrictionActive,
            long restrictionRevision,
            List<String> restrictionMatches,
            boolean restrictionSatisfied,
            boolean decisive) {
        public DecisionTraceView {
            subjectGrants = List.copyOf(subjectGrants);
            restrictionMatches = List.copyOf(restrictionMatches);
        }
    }

    public record GrantView(
            ResourceView resource,
            PrincipalView principal,
            PermissionRole role,
            List<PermissionOperation> operations,
            boolean editable,
            List<PermissionAction> allowedActions) {
        public GrantView {
            operations = List.copyOf(operations);
            allowedActions = List.copyOf(allowedActions);
        }
    }

    public record ResourceView(String type, UUID id, String source) {}

    public record PrincipalView(
            String key,
            String type,
            @Schema(nullable = true) UUID id,
            String name,
            String status,
            @Schema(nullable = true) String email,
            @Schema(nullable = true) String avatar,
            @Schema(nullable = true) Long memberCount) {}

    public enum PermissionRole {
        ADMIN("admin"),
        MAINTAINER("maintainer"),
        AUTHOR("author"),
        READER("reader"),
        NONE("none");

        private final String value;

        PermissionRole(String value) {
            this.value = value;
        }

        static PermissionRole of(String value) {
            return valueOf(value.toUpperCase(Locale.ROOT));
        }

        @JsonValue
        public String value() {
            return value;
        }
    }

    public enum PermissionOperation {
        READ("read"),
        WRITE("write"),
        PUBLISH("publish"),
        ADMIN("admin");

        private final String value;

        PermissionOperation(String value) {
            this.value = value;
        }

        static PermissionOperation of(String value) {
            return valueOf(value.toUpperCase(Locale.ROOT));
        }

        @JsonValue
        public String value() {
            return value;
        }
    }

    public enum PermissionAction {
        GRANT("grant"),
        OVERRIDE("override"),
        SET_NONE("set_none"),
        CHANGE_ROLE("change_role"),
        REVOKE("revoke"),
        EXPLAIN("explain"),
        RESTRICT("restrict"),
        REPLACE_RESTRICTION("replace_restriction"),
        NARROW_RESTRICTION("narrow_restriction"),
        UNRESTRICT("unrestrict");

        private final String value;

        PermissionAction(String value) {
            this.value = value;
        }

        @JsonValue
        public String value() {
            return value;
        }
    }

    public enum EffectiveReason {
        DIRECT_GRANT("direct_grant"),
        TEAM_GRANT("team_grant"),
        EXPLICIT_NONE("explicit_none"),
        NO_GRANT("no_grant"),
        RESTRICTION_MISS("restriction_miss");

        private final String value;

        EffectiveReason(String value) {
            this.value = value;
        }

        @JsonValue
        public String value() {
            return value;
        }
    }
}
