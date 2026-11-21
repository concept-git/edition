package io.edition.control.entry.http.site;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import io.edition.control.compositions.hosting.reorganization.RemountUseCase;
import io.edition.control.compositions.hosting.site.CreateSiteUseCase;
import io.edition.control.compositions.hosting.site.ListSitesUseCase;
import io.edition.control.compositions.hosting.site.MountSpaceUseCase;
import io.edition.control.compositions.hosting.site.ReorderMountsUseCase;
import io.edition.control.compositions.hosting.site.SiteTypes;
import io.edition.control.compositions.hosting.site.UnmountSpaceUseCase;
import io.edition.control.compositions.hosting.site.UpdateSiteUseCase;
import io.edition.control.compositions.hosting.site.ViewSiteUseCase;
import io.edition.control.entry.http.problem.ApiProblem;
import io.edition.control.entry.http.security.BearerCredential;
import io.edition.control.entry.http.security.IdempotencyKeyFilter;
import io.edition.control.entry.http.security.IdempotentReplay;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Site 管理端点：DTO ↔ flow 翻译。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/sites")
class SiteController {
    private static final String MERGE_PATCH = "application/merge-patch+json";
    private final CreateSiteUseCase createSiteUseCase;
    private final ListSitesUseCase listSitesUseCase;
    private final ViewSiteUseCase viewSiteUseCase;
    private final UpdateSiteUseCase updateSiteUseCase;
    private final MountSpaceUseCase mountSpaceUseCase;
    private final UnmountSpaceUseCase unmountSpaceUseCase;
    private final ReorderMountsUseCase reorderMountsUseCase;
    private final RemountUseCase remountUseCase;
    private final BearerCredential bearer;

    SiteController(
            CreateSiteUseCase createSiteUseCase,
            ListSitesUseCase listSitesUseCase,
            ViewSiteUseCase viewSiteUseCase,
            UpdateSiteUseCase updateSiteUseCase,
            MountSpaceUseCase mountSpaceUseCase,
            UnmountSpaceUseCase unmountSpaceUseCase,
            ReorderMountsUseCase reorderMountsUseCase,
            RemountUseCase remountUseCase,
            BearerCredential bearer) {
        this.createSiteUseCase = createSiteUseCase;
        this.listSitesUseCase = listSitesUseCase;
        this.viewSiteUseCase = viewSiteUseCase;
        this.updateSiteUseCase = updateSiteUseCase;
        this.mountSpaceUseCase = mountSpaceUseCase;
        this.unmountSpaceUseCase = unmountSpaceUseCase;
        this.reorderMountsUseCase = reorderMountsUseCase;
        this.remountUseCase = remountUseCase;
        this.bearer = bearer;
    }

    @PostMapping
    @Operation(operationId = "createSite", summary = "Create a tenant Site")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = SiteContract.DetailResponse.class))),
        @ApiResponse(
                responseCode = "401",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "403",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "409",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "422",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class)))
    })
    ResponseEntity<String> create(
            @PathVariable UUID tenantId,
            @Valid @RequestBody CreateSiteRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(createSiteUseCase.createSite(
                bearer.require(), tenantId, body.name(), IdempotencyKeyFilter.require(request)));
    }

    @GetMapping
    @Operation(operationId = "listSites", summary = "List readable Sites with an opaque cursor")
    SiteContract.PageResponse list(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return SiteContract.PageResponse.from(listSitesUseCase.listSites(bearer.require(), tenantId, cursor, limit));
    }

    @GetMapping("/{siteId}")
    @Operation(operationId = "viewSite", summary = "Read one Site by stable id")
    SiteContract.DetailResponse view(@PathVariable UUID tenantId, @PathVariable UUID siteId) {
        return SiteContract.DetailResponse.from(viewSiteUseCase.viewSite(bearer.require(), tenantId, siteId));
    }

    @PatchMapping(
            value = "/{siteId}",
            consumes = {MERGE_PATCH, MediaType.APPLICATION_JSON_VALUE})
    @Operation(operationId = "updateSite", summary = "Merge-patch Site settings")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> update(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @RequestBody UpdateSiteRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(updateSiteUseCase.updateSite(
                bearer.require(), tenantId, siteId, body.patch(), IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/{siteId}/mounts/{slug}")
    @Operation(operationId = "mountSpace", summary = "Mount a Space at a Site slug")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> mount(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable String slug,
            @Valid @RequestBody MountRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(mountSpaceUseCase.mountSpace(
                bearer.require(), tenantId, siteId, slug, body.spaceId(), IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/{siteId}/mounts/{slug}:remount")
    @Operation(operationId = "remountSpace", summary = "Change a Site mount slug and register a redirect")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> remount(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable String slug,
            @Valid @RequestBody RemountRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(remountUseCase.remount(
                bearer.require(), tenantId, siteId, slug, null, body.newSlug(), IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/{siteId}/mounts/{slug}")
    @Operation(operationId = "unmountSpace", summary = "Unmount a Space from a Site slug")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> unmount(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable String slug,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(unmountSpaceUseCase.unmountSpace(
                bearer.require(), tenantId, siteId, slug, null, IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/{siteId}/mounts:order")
    @Operation(operationId = "reorderMounts", summary = "Reorder Site mounts")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> reorder(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @Valid @RequestBody OrderRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(reorderMountsUseCase.reorderMounts(
                bearer.require(), tenantId, siteId, body.slugs(), null, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/{siteId}/space-mounts/{spaceId}:remount")
    @Operation(operationId = "remountSpaceById", summary = "Change the mount address of a Space identified by ID")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> remountById(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody RemountRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(remountUseCase.remount(
                bearer.require(),
                tenantId,
                siteId,
                null,
                spaceId,
                body.newSlug(),
                IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/{siteId}/space-mounts/{spaceId}")
    @Operation(operationId = "unmountSpaceById", summary = "Unmount the Space identified by ID")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> unmountById(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable UUID spaceId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(unmountSpaceUseCase.unmountSpace(
                bearer.require(), tenantId, siteId, null, spaceId, IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/{siteId}/space-mounts:order")
    @Operation(
            operationId = "reorderMountsBySpaceId",
            summary = "Reorder mounts using the complete sequence of Space IDs")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> reorderById(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @Valid @RequestBody SpaceOrderRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(reorderMountsUseCase.reorderMounts(
                bearer.require(), tenantId, siteId, null, body.spaceIds(), IdempotencyKeyFilter.require(request)));
    }

    record SpaceOrderRequest(@NotNull List<@NotNull UUID> spaceIds) {}

    record CreateSiteRequest(@NotBlank @Size(max = 120) String name) {}

    record MountRequest(@NotNull UUID spaceId) {}

    record RemountRequest(@NotBlank @Size(max = 80) String newSlug) {}

    record OrderRequest(@NotNull List<@NotBlank String> slugs) {}

    @Schema(name = "UpdateSiteRequest", description = "JSON Merge Patch: omitted keeps, null clears")
    static final class UpdateSiteRequest {
        private boolean namePresent;
        private boolean titleTemplatePresent;
        private boolean brandingPresent;
        private boolean localePresent;
        private boolean analyticsPresent;
        private boolean robotsPresent;
        private boolean homePresent;
        private boolean rulePresent;
        private String name;
        private String titleTemplate;
        private BrandingPatch branding;
        private String locale;
        private String analyticsId;
        private String robotsPolicy;
        private UUID home;
        private String rule;

        @JsonSetter("name")
        public void setName(String value) {
            namePresent = true;
            name = value;
        }

        @JsonSetter("titleTemplate")
        public void setTitleTemplate(String value) {
            titleTemplatePresent = true;
            titleTemplate = value;
        }

        @JsonSetter("branding")
        public void setBranding(BrandingPatch value) {
            brandingPresent = true;
            branding = value;
        }

        @JsonSetter("locale")
        public void setLocale(String value) {
            localePresent = true;
            locale = value;
        }

        @JsonSetter("analyticsId")
        public void setAnalyticsId(String value) {
            analyticsPresent = true;
            analyticsId = value;
        }

        @JsonSetter("robotsPolicy")
        public void setRobotsPolicy(String value) {
            robotsPresent = true;
            robotsPolicy = value;
        }

        @JsonSetter("home")
        public void setHome(UUID value) {
            homePresent = true;
            home = value;
        }

        @JsonSetter("rule")
        public void setRule(String value) {
            rulePresent = true;
            rule = value;
        }

        @JsonProperty("name")
        @Schema(nullable = true, maxLength = 120)
        public String name() {
            return name;
        }

        @JsonProperty("titleTemplate")
        @Schema(
                nullable = true,
                maxLength = 120,
                description = "Contains exactly one %s placeholder; null restores the default.",
                pattern = "^(?:(?!%s)[\\s\\S])*%s(?:(?!%s)[\\s\\S])*$")
        public String titleTemplate() {
            return titleTemplate;
        }

        @JsonProperty("branding")
        @Schema(nullable = true)
        public BrandingPatch branding() {
            return branding;
        }

        @JsonProperty("locale")
        @Schema(nullable = true)
        public String locale() {
            return locale;
        }

        @JsonProperty("analyticsId")
        @Schema(nullable = true)
        public String analyticsId() {
            return analyticsId;
        }

        @JsonProperty("robotsPolicy")
        @Schema(
                nullable = true,
                allowableValues = {"index", "noindex"})
        public String robotsPolicy() {
            return robotsPolicy;
        }

        @JsonProperty("home")
        @Schema(nullable = true)
        public UUID home() {
            return home;
        }

        @JsonProperty("rule")
        @Schema(nullable = true)
        public String rule() {
            return rule;
        }

        SiteTypes.UpdatePatch patch() {
            BrandingPatch nested = branding == null ? new BrandingPatch() : branding;
            return SiteTypes.UpdatePatch.fromJson(
                    namePresent,
                    name,
                    titleTemplatePresent,
                    titleTemplate,
                    brandingPresent,
                    branding == null,
                    nested.logoPresent,
                    nested.logo,
                    nested.faviconPresent,
                    nested.favicon,
                    nested.primaryColorPresent,
                    nested.primaryColor,
                    localePresent,
                    locale,
                    analyticsPresent,
                    analyticsId,
                    robotsPresent,
                    robotsPolicy,
                    homePresent,
                    home,
                    rulePresent,
                    rule);
        }
    }

    @Schema(name = "UpdateSiteBranding")
    static final class BrandingPatch {
        private boolean logoPresent;
        private boolean faviconPresent;
        private boolean primaryColorPresent;
        private String logo;
        private String favicon;
        private String primaryColor;

        @JsonSetter("logo")
        public void setLogo(String value) {
            logoPresent = true;
            logo = value;
        }

        @JsonSetter("favicon")
        public void setFavicon(String value) {
            faviconPresent = true;
            favicon = value;
        }

        @JsonSetter("primaryColor")
        public void setPrimaryColor(String value) {
            primaryColorPresent = true;
            primaryColor = value;
        }

        @JsonProperty("logo")
        @Schema(nullable = true)
        public String logo() {
            return logo;
        }

        @JsonProperty("favicon")
        @Schema(nullable = true)
        public String favicon() {
            return favicon;
        }

        @JsonProperty("primaryColor")
        @Schema(nullable = true)
        public String primaryColor() {
            return primaryColor;
        }
    }

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = SiteContract.DetailResponse.class))),
        @ApiResponse(
                responseCode = "401",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "403",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "404",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "409",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "422",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class)))
    })
    @interface MutationResponses {}
}
