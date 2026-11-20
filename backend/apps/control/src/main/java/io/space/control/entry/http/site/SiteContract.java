package io.space.control.entry.http.site;

import io.space.control.compositions.hosting.site.SiteTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class SiteContract {
    private SiteContract() {}

    @Schema(name = "SitePage")
    record PageResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<SummaryResponse> items,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String nextCursor,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            Long total,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<SiteTypes.Action> allowedActions) {
        static PageResponse from(SiteTypes.SitePage page) {
            return new PageResponse(
                    page.items().stream().map(SummaryResponse::from).toList(),
                    page.nextCursor(),
                    page.total(),
                    page.allowedActions());
        }
    }

    @Schema(name = "SiteSummary")
    record SummaryResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID id,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID tenantId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String name,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String rule,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID home,

            @Schema(
                    requiredMode = Schema.RequiredMode.REQUIRED,
                    allowableValues = {"index", "noindex"})
            String robotsPolicy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<DomainResponse> domains,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            Instant createdAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID createdBy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            Instant updatedAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID updatedBy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<SiteTypes.Action> allowedActions) {
        static SummaryResponse from(SiteTypes.SiteSummary value) {
            return new SummaryResponse(
                    value.id(),
                    value.tenantId(),
                    value.name(),
                    value.rule(),
                    value.home(),
                    value.robotsPolicy(),
                    value.domains().stream().map(DomainResponse::from).toList(),
                    value.createdAt(),
                    value.createdBy(),
                    value.updatedAt(),
                    value.updatedBy(),
                    value.allowedActions());
        }
    }

    @Schema(name = "SiteDetail")
    public record DetailResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID id,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID tenantId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String name,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String rule,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID home,

            @Schema(
                    requiredMode = Schema.RequiredMode.REQUIRED,
                    allowableValues = {"index", "noindex"})
            String robotsPolicy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String titleTemplate,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            BrandingResponse branding,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String locale,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String analyticsId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<MountResponse> mounts,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<DomainResponse> domains,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            Instant createdAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID createdBy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            Instant updatedAt,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            UUID updatedBy,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            List<SiteTypes.Action> allowedActions) {
        static DetailResponse from(SiteTypes.SiteDetail value) {
            return new DetailResponse(
                    value.id(),
                    value.tenantId(),
                    value.name(),
                    value.rule(),
                    value.home(),
                    value.robotsPolicy(),
                    value.titleTemplate(),
                    BrandingResponse.from(value.branding()),
                    value.locale(),
                    value.analyticsId(),
                    value.mounts().stream().map(MountResponse::from).toList(),
                    value.domains().stream().map(DomainResponse::from).toList(),
                    value.createdAt(),
                    value.createdBy(),
                    value.updatedAt(),
                    value.updatedBy(),
                    value.allowedActions());
        }
    }

    @Schema(name = "SiteMount")
    record MountResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID spaceId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String slug) {
        static MountResponse from(SiteTypes.Mount value) {
            return new MountResponse(value.spaceId(), value.slug());
        }
    }

    @Schema(name = "SiteBranding")
    record BrandingResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String logo,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String favicon,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String primaryColor) {
        static BrandingResponse from(SiteTypes.Branding value) {
            SiteTypes.Branding branding = value == null ? new SiteTypes.Branding(null, null, null) : value;
            return new BrandingResponse(branding.logo(), branding.favicon(), branding.primaryColor());
        }
    }

    @Schema(name = "SiteDomain")
    record DomainResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String host,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean verified,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean isPrimary) {
        static DomainResponse from(SiteTypes.Domain value) {
            return new DomainResponse(value.host(), value.verified(), value.isPrimary());
        }
    }
}
