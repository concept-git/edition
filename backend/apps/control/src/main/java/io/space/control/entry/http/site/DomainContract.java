package io.space.control.entry.http.site;

import io.space.control.compositions.hosting.customdomain.CustomDomainTypes;
import io.swagger.v3.oas.annotations.media.Schema;

public final class DomainContract {
    private DomainContract() {}

    @Schema(name = "TenantDomainPage")
    public record TenantPageResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            java.util.List<TenantSummaryResponse> items,

            String nextCursor,
            Long total,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            java.util.List<SiteChoiceResponse> sites) {
        static TenantPageResponse from(CustomDomainTypes.TenantDomainPage value) {
            return new TenantPageResponse(
                    value.items().stream().map(TenantSummaryResponse::from).toList(),
                    value.nextCursor(),
                    value.total(),
                    value.sites().stream().map(SiteChoiceResponse::from).toList());
        }
    }

    @Schema(name = "TenantDomainSummary")
    public record TenantSummaryResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String host,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean verified,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean isPrimary,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            java.time.Instant createdAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            java.util.UUID siteId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String siteName,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            java.util.Set<String> allowedActions) {
        static TenantSummaryResponse from(CustomDomainTypes.TenantDomainSummary value) {
            return new TenantSummaryResponse(
                    value.host(),
                    value.verified(),
                    value.isPrimary(),
                    value.createdAt(),
                    value.siteId(),
                    value.siteName(),
                    actions(value.allowedActions()));
        }
    }

    @Schema(name = "DomainSiteChoice")
    public record SiteChoiceResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            java.util.UUID id,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String name,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            java.util.Set<String> allowedActions) {
        static SiteChoiceResponse from(CustomDomainTypes.DomainSiteChoice value) {
            return new SiteChoiceResponse(value.id(), value.name(), actions(value.allowedActions()));
        }
    }

    private static java.util.Set<String> actions(java.util.Set<CustomDomainTypes.DomainAction> actions) {
        return actions.stream()
                .map(CustomDomainTypes.DomainAction::value)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    @Schema(name = "DomainDetail")
    public record DetailResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String host,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean verified,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean isPrimary,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String dnsToken,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String txtName,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String txtValue) {
        static DetailResponse from(CustomDomainTypes.DomainDetail value) {
            return new DetailResponse(
                    value.host(),
                    value.verified(),
                    value.isPrimary(),
                    value.dnsToken(),
                    value.txtName(),
                    value.txtValue());
        }
    }
}
