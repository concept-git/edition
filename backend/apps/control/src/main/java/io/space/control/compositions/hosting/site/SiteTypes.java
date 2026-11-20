package io.space.control.compositions.hosting.site;

import static io.space.control.compositions.hosting.site.SiteTypes.*;

import com.fasterxml.jackson.annotation.JsonValue;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class SiteTypes {
    private SiteTypes() {}

    public record UpdatePatch(
            SitePatch.Change<String> name,
            SitePatch.Change<String> titleTemplate,
            SitePatch.BrandingChange branding,
            SitePatch.Change<String> locale,
            SitePatch.Change<String> analyticsId,
            SitePatch.Change<String> robotsPolicy,
            SitePatch.Change<UUID> home,
            SitePatch.Change<String> rule) {
        public UpdatePatch {
            name = name == null ? new SitePatch.Change.Unchanged<>() : name;
            titleTemplate = titleTemplate == null ? new SitePatch.Change.Unchanged<>() : titleTemplate;
            branding = branding == null ? new SitePatch.BrandingChange(null, null, null) : branding;
            locale = locale == null ? new SitePatch.Change.Unchanged<>() : locale;
            analyticsId = analyticsId == null ? new SitePatch.Change.Unchanged<>() : analyticsId;
            robotsPolicy = robotsPolicy == null ? new SitePatch.Change.Unchanged<>() : robotsPolicy;
            home = home == null ? new SitePatch.Change.Unchanged<>() : home;
            rule = rule == null ? new SitePatch.Change.Unchanged<>() : rule;
        }

        boolean empty() {
            return name instanceof SitePatch.Change.Unchanged<?>
                    && titleTemplate instanceof SitePatch.Change.Unchanged<?>
                    && branding.empty()
                    && locale instanceof SitePatch.Change.Unchanged<?>
                    && analyticsId instanceof SitePatch.Change.Unchanged<?>
                    && robotsPolicy instanceof SitePatch.Change.Unchanged<?>
                    && home instanceof SitePatch.Change.Unchanged<?>
                    && rule instanceof SitePatch.Change.Unchanged<?>;
        }

        public static UpdatePatch fromJson(
                boolean namePresent,
                String name,
                boolean titleTemplatePresent,
                String titleTemplate,
                boolean brandingPresent,
                boolean brandingCleared,
                boolean logoPresent,
                String logo,
                boolean faviconPresent,
                String favicon,
                boolean primaryColorPresent,
                String primaryColor,
                boolean localePresent,
                String locale,
                boolean analyticsPresent,
                String analyticsId,
                boolean robotsPresent,
                String robotsPolicy,
                boolean homePresent,
                UUID home,
                boolean rulePresent,
                String rule) {
            return new UpdatePatch(
                    field(namePresent, name),
                    field(titleTemplatePresent, titleTemplate),
                    brandingPresent
                            ? (brandingCleared
                                    ? new SitePatch.BrandingChange(
                                            new SitePatch.Change.Clear<>(),
                                            new SitePatch.Change.Clear<>(),
                                            new SitePatch.Change.Clear<>())
                                    : new SitePatch.BrandingChange(
                                            field(logoPresent, logo),
                                            field(faviconPresent, favicon),
                                            field(primaryColorPresent, primaryColor)))
                            : new SitePatch.BrandingChange(null, null, null),
                    field(localePresent, locale),
                    field(analyticsPresent, analyticsId),
                    field(robotsPresent, robotsPolicy),
                    homePresent
                            ? (home == null ? new SitePatch.Change.Clear<>() : new SitePatch.Change.Set<>(home))
                            : new SitePatch.Change.Unchanged<>(),
                    field(rulePresent, rule));
        }

        private static SitePatch.Change<String> field(boolean present, String value) {
            if (!present) return new SitePatch.Change.Unchanged<>();
            return value == null ? new SitePatch.Change.Clear<>() : new SitePatch.Change.Set<>(value);
        }
    }

    public record SitePage(List<SiteSummary> items, String nextCursor, Long total, List<Action> allowedActions) {
        public SitePage {
            items = List.copyOf(items);
            allowedActions = List.copyOf(allowedActions);
        }
    }

    public record SiteSummary(
            UUID id,
            UUID tenantId,
            String name,
            String rule,
            UUID home,
            String robotsPolicy,
            List<Domain> domains,
            Instant createdAt,
            UUID createdBy,
            Instant updatedAt,
            UUID updatedBy,
            List<Action> allowedActions) {
        public SiteSummary {
            domains = List.copyOf(domains);
            allowedActions = List.copyOf(allowedActions);
        }
    }

    public record SiteDetail(
            UUID id,
            UUID tenantId,
            String name,
            String rule,
            UUID home,
            String robotsPolicy,
            String titleTemplate,
            Branding branding,
            String locale,
            String analyticsId,
            List<Mount> mounts,
            List<Domain> domains,
            Instant createdAt,
            UUID createdBy,
            Instant updatedAt,
            UUID updatedBy,
            List<Action> allowedActions) {
        public SiteDetail {
            mounts = List.copyOf(mounts);
            domains = List.copyOf(domains);
            allowedActions = List.copyOf(allowedActions);
            branding = branding == null ? new Branding(null, null, null) : branding;
        }
    }

    public record Mount(UUID spaceId, String slug) {}

    public record Branding(String logo, String favicon, String primaryColor) {}

    public record Domain(String host, boolean verified, boolean isPrimary) {}

    public record SpaceMount(UUID siteId, String siteName, String slug, String primaryHost) {}

    public enum Action {
        CREATE("create"),
        READ("read"),
        UPDATE("update"),
        MOUNT("mount"),
        UNMOUNT("unmount"),
        REMOUNT("remount"),
        REORDER("reorder"),
        DELETE("delete"),
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
