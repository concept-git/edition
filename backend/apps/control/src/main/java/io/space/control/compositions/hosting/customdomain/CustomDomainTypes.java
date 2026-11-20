package io.space.control.compositions.hosting.customdomain;

import static io.space.control.compositions.hosting.customdomain.CustomDomainTypes.*;

import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class CustomDomainTypes {
    private CustomDomainTypes() {}

    public record DomainDetail(
            String host, boolean verified, boolean isPrimary, String dnsToken, String txtName, String txtValue) {}

    public record TenantDomainSummary(
            String host,
            boolean verified,
            boolean isPrimary,
            java.time.Instant createdAt,
            UUID siteId,
            String siteName,
            java.util.Set<DomainAction> allowedActions) {
        public TenantDomainSummary {
            allowedActions = allowedActions == null ? java.util.Set.of() : java.util.Set.copyOf(allowedActions);
        }
    }

    public record DomainSiteChoice(UUID id, String name, java.util.Set<DomainAction> allowedActions) {
        public DomainSiteChoice {
            allowedActions = allowedActions == null ? java.util.Set.of() : java.util.Set.copyOf(allowedActions);
        }
    }

    public record TenantDomainPage(
            java.util.List<TenantDomainSummary> items,
            String nextCursor,
            Long total,
            java.util.List<DomainSiteChoice> sites) {
        public TenantDomainPage {
            items = items == null ? java.util.List.of() : java.util.List.copyOf(items);
            sites = sites == null ? java.util.List.of() : java.util.List.copyOf(sites);
        }
    }

    public enum DomainAction {
        BIND("bind"),
        UPDATE("update");
        private final String value;

        DomainAction(String value) {
            this.value = value;
        }

        @com.fasterxml.jackson.annotation.JsonValue
        public String value() {
            return value;
        }
    }
}
