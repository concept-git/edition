package io.edition.control.adapters.inbound.http.space;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import io.edition.control.adapters.inbound.http.problem.ApiProblem;
import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.adapters.inbound.http.security.IdempotencyKeyFilter;
import io.edition.control.adapters.inbound.http.security.IdempotentReplay;
import io.edition.control.usecases.authoring.space.ArchiveSpaceUseCase;
import io.edition.control.usecases.authoring.space.ConvertSpaceUseCase;
import io.edition.control.usecases.authoring.space.CreateSpaceUseCase;
import io.edition.control.usecases.authoring.space.ListSpacesUseCase;
import io.edition.control.usecases.authoring.space.RestoreSpaceUseCase;
import io.edition.control.usecases.authoring.space.SpaceTypes;
import io.edition.control.usecases.authoring.space.UpdateSpaceUseCase;
import io.edition.control.usecases.authoring.space.ViewSpaceUseCase;
import io.edition.control.usecases.hosting.site.ListSpaceMountsUseCase;
import io.edition.control.usecases.hosting.site.SiteTypes;
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
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Space 管理端点：DTO ↔ flow 翻译；查询参数约束由 Spring MVC 内建方法校验统一转成 422 validation_failed。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/spaces")
class SpaceController {
    private static final String MERGE_PATCH = "application/merge-patch+json";
    private final CreateSpaceUseCase createSpaceUseCase;
    private final ListSpacesUseCase listSpacesUseCase;
    private final ViewSpaceUseCase viewSpaceUseCase;
    private final UpdateSpaceUseCase updateSpaceUseCase;
    private final ArchiveSpaceUseCase archiveSpaceUseCase;
    private final RestoreSpaceUseCase restoreSpaceUseCase;
    private final ConvertSpaceUseCase convertSpaceUseCase;
    private final ListSpaceMountsUseCase listSpaceMountsUseCase;
    private final BearerCredential bearer;

    SpaceController(
            CreateSpaceUseCase createSpaceUseCase,
            ListSpacesUseCase listSpacesUseCase,
            ViewSpaceUseCase viewSpaceUseCase,
            UpdateSpaceUseCase updateSpaceUseCase,
            ArchiveSpaceUseCase archiveSpaceUseCase,
            RestoreSpaceUseCase restoreSpaceUseCase,
            ConvertSpaceUseCase convertSpaceUseCase,
            ListSpaceMountsUseCase listSpaceMountsUseCase,
            BearerCredential bearer) {
        this.createSpaceUseCase = createSpaceUseCase;
        this.listSpacesUseCase = listSpacesUseCase;
        this.viewSpaceUseCase = viewSpaceUseCase;
        this.updateSpaceUseCase = updateSpaceUseCase;
        this.archiveSpaceUseCase = archiveSpaceUseCase;
        this.restoreSpaceUseCase = restoreSpaceUseCase;
        this.convertSpaceUseCase = convertSpaceUseCase;
        this.listSpaceMountsUseCase = listSpaceMountsUseCase;
        this.bearer = bearer;
    }

    @PostMapping
    @Operation(operationId = "createSpace", summary = "Create a tenant Space")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = SpaceContract.DetailResponse.class))),
        @ApiResponse(
                responseCode = "400",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
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
            @Valid @RequestBody CreateSpaceRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(createSpaceUseCase.createSpace(
                bearer.require(), tenantId, body.name(), body.mode(), IdempotencyKeyFilter.require(request)));
    }

    @GetMapping
    @Operation(operationId = "listSpaces", summary = "List readable Spaces with an opaque cursor")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = SpaceContract.PageResponse.class))),
        @ApiResponse(
                responseCode = "400",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
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
                                schema = @Schema(implementation = ApiProblem.class)))
    })
    SpaceContract.PageResponse list(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit,
            @RequestParam(required = false) @Pattern(regexp = "active|archived") String status,
            @RequestParam(required = false) @Pattern(regexp = "authored|synced") String mode,
            @RequestParam(required = false)
                    @Pattern(
                            regexp =
                                    "ungrouped|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
                    String collectionId) {
        return SpaceContract.PageResponse.from(
                listSpacesUseCase.listSpaces(bearer.require(), tenantId, cursor, limit, status, mode, collectionId));
    }

    @GetMapping("/{spaceId}")
    @Operation(operationId = "viewSpace", summary = "Read one Space by stable id")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = SpaceContract.DetailResponse.class))),
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
                                schema = @Schema(implementation = ApiProblem.class)))
    })
    SpaceContract.DetailResponse view(@PathVariable UUID tenantId, @PathVariable UUID spaceId) {
        return SpaceContract.DetailResponse.from(viewSpaceUseCase.viewSpace(bearer.require(), tenantId, spaceId));
    }

    @GetMapping("/{spaceId}/mounts")
    @Operation(operationId = "listSpaceMounts", summary = "List delivery mounts for one Space")
    List<SiteTypes.SpaceMount> mounts(@PathVariable UUID tenantId, @PathVariable UUID spaceId) {
        return listSpaceMountsUseCase.listSpaceMounts(bearer.require(), tenantId, spaceId);
    }

    @PatchMapping(
            value = "/{spaceId}",
            consumes = {MERGE_PATCH, MediaType.APPLICATION_JSON_VALUE})
    @Operation(operationId = "updateSpace", summary = "Merge-patch Space metadata")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> update(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestBody UpdateSpaceRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(updateSpaceUseCase.updateSpace(
                bearer.require(), tenantId, spaceId, body.patch(), IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/{spaceId}:archive")
    @Operation(operationId = "archiveSpace", summary = "Archive a Space")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> archive(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(archiveSpaceUseCase.archiveSpace(
                bearer.require(), tenantId, spaceId, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/{spaceId}:restore")
    @Operation(operationId = "restoreSpace", summary = "Restore an archived Space")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> restore(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(restoreSpaceUseCase.restoreSpace(
                bearer.require(), tenantId, spaceId, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/{spaceId}:convert")
    @Operation(operationId = "convertSpace", summary = "Convert a Space between authored and synced modes")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> convert(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody ConvertSpaceRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(convertSpaceUseCase.convertSpace(
                bearer.require(), tenantId, spaceId, body.mode(), IdempotencyKeyFilter.require(request)));
    }

    record CreateSpaceRequest(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Pattern(regexp = "authored|synced") String mode) {}

    record ConvertSpaceRequest(
            @NotBlank @Pattern(regexp = "authored|synced") String mode) {}

    @Schema(name = "UpdateSpaceRequest", description = "JSON Merge Patch: omitted keeps, null clears")
    static final class UpdateSpaceRequest {
        private boolean namePresent;
        private boolean iconPresent;
        private boolean descriptionPresent;
        private boolean autoReleasePresent;
        private String name;
        private String icon;
        private String description;
        private Boolean autoRelease;

        @JsonSetter("name")
        public void setName(String value) {
            namePresent = true;
            name = value;
        }

        @JsonSetter("icon")
        public void setIcon(String value) {
            iconPresent = true;
            icon = value;
        }

        @JsonSetter("description")
        public void setDescription(String value) {
            descriptionPresent = true;
            description = value;
        }

        @JsonSetter("autoRelease")
        public void setAutoRelease(Boolean value) {
            autoReleasePresent = true;
            autoRelease = value;
        }

        @JsonProperty("name")
        @Schema(nullable = true, maxLength = 120)
        public String name() {
            return name;
        }

        @JsonProperty("icon")
        @Schema(
                nullable = true,
                allowableValues = {"book", "code", "api", "guide", "reference"})
        public String icon() {
            return icon;
        }

        @JsonProperty("description")
        @Schema(nullable = true, maxLength = 4000)
        public String description() {
            return description;
        }

        @JsonProperty("autoRelease")
        @Schema(nullable = true)
        public Boolean autoRelease() {
            return autoRelease;
        }

        SpaceTypes.UpdatePatch patch() {
            return SpaceTypes.UpdatePatch.fromJson(
                    namePresent,
                    name,
                    iconPresent,
                    icon,
                    descriptionPresent,
                    description,
                    autoReleasePresent,
                    autoRelease);
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
                                schema = @Schema(implementation = SpaceContract.DetailResponse.class))),
        @ApiResponse(
                responseCode = "400",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
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
