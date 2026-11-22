package io.edition.control.adapters.inbound.http.release;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.adapters.inbound.http.security.IdempotencyKeyFilter;
import io.edition.control.adapters.inbound.http.security.IdempotentReplay;
import io.edition.control.adapters.inbound.http.space.SpaceContract;
import io.edition.control.usecases.releases.release.BuildReleaseUseCase;
import io.edition.control.usecases.releases.release.DiffReleasesUseCase;
import io.edition.control.usecases.releases.release.DiscardReleaseUseCase;
import io.edition.control.usecases.releases.release.ListReleasesUseCase;
import io.edition.control.usecases.releases.release.PatchReleaseUseCase;
import io.edition.control.usecases.releases.release.PromoteReleaseUseCase;
import io.edition.control.usecases.releases.release.ReleaseTypes;
import io.edition.control.usecases.releases.release.RollbackUseCase;
import io.edition.control.usecases.releases.release.SetRetentionUseCase;
import io.edition.control.usecases.releases.release.ViewReleaseUseCase;
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
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 发版端点：DTO ↔ publishing flow。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/spaces/{spaceId}")
class ReleaseController {
    private static final String MERGE_PATCH = "application/merge-patch+json";
    private final BuildReleaseUseCase buildReleaseUseCase;
    private final ListReleasesUseCase listReleasesUseCase;
    private final ViewReleaseUseCase viewReleaseUseCase;
    private final DiffReleasesUseCase diffReleasesUseCase;
    private final DiscardReleaseUseCase discardReleaseUseCase;
    private final PromoteReleaseUseCase promoteReleaseUseCase;
    private final RollbackUseCase rollbackUseCase;
    private final SetRetentionUseCase setRetentionUseCase;
    private final PatchReleaseUseCase patchReleaseUseCase;
    private final BearerCredential bearer;

    ReleaseController(
            BuildReleaseUseCase buildReleaseUseCase,
            ListReleasesUseCase listReleasesUseCase,
            ViewReleaseUseCase viewReleaseUseCase,
            DiffReleasesUseCase diffReleasesUseCase,
            DiscardReleaseUseCase discardReleaseUseCase,
            PromoteReleaseUseCase promoteReleaseUseCase,
            RollbackUseCase rollbackUseCase,
            SetRetentionUseCase setRetentionUseCase,
            PatchReleaseUseCase patchReleaseUseCase,
            BearerCredential bearer) {
        this.buildReleaseUseCase = buildReleaseUseCase;
        this.listReleasesUseCase = listReleasesUseCase;
        this.viewReleaseUseCase = viewReleaseUseCase;
        this.diffReleasesUseCase = diffReleasesUseCase;
        this.discardReleaseUseCase = discardReleaseUseCase;
        this.promoteReleaseUseCase = promoteReleaseUseCase;
        this.rollbackUseCase = rollbackUseCase;
        this.setRetentionUseCase = setRetentionUseCase;
        this.patchReleaseUseCase = patchReleaseUseCase;
        this.bearer = bearer;
    }

    @PostMapping("/releases:build")
    @Operation(
            operationId = "buildRelease",
            summary = "Build a Release from published Pages and promote when it differs")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @BuildResponses
    ResponseEntity<String> build(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(buildReleaseUseCase.buildRelease(
                bearer.require(), tenantId, spaceId, IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/releases")
    @Operation(operationId = "listReleases", summary = "List Releases in a Space")
    ReleaseContract.PageResponse list(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return ReleaseContract.PageResponse.from(
                listReleasesUseCase.listReleases(bearer.require(), tenantId, spaceId, cursor, limit));
    }

    @GetMapping("/releases:diff")
    @Operation(operationId = "diffReleases", summary = "Diff two Releases in a Space")
    ReleaseContract.DeltaResponse diff(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @RequestParam UUID from, @RequestParam UUID to) {
        return ReleaseContract.DeltaResponse.from(
                diffReleasesUseCase.diffReleases(bearer.require(), tenantId, spaceId, from, to));
    }

    @GetMapping("/releases/{releaseId}")
    @Operation(operationId = "viewRelease", summary = "Read one Release with its report and live diff")
    ReleaseContract.DetailResponse view(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @PathVariable UUID releaseId) {
        return ReleaseContract.DetailResponse.from(
                viewReleaseUseCase.viewRelease(bearer.require(), tenantId, spaceId, releaseId));
    }

    @PostMapping("/releases/{releaseId}:discard")
    @Operation(operationId = "discardRelease", summary = "Discard a draft, flagged or validated Release")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> discard(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID releaseId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(discardReleaseUseCase.discardRelease(
                bearer.require(), tenantId, spaceId, releaseId, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/releases/{releaseId}:rollback")
    @Operation(operationId = "rollbackRelease", summary = "Promote an archived Release back to live")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> rollback(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID releaseId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(rollbackUseCase.rollback(
                bearer.require(), tenantId, spaceId, releaseId, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/releases/{releaseId}:promote")
    @Operation(operationId = "promoteRelease", summary = "Promote a validated or archived Release")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> promote(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID releaseId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(promoteReleaseUseCase.promoteRelease(
                bearer.require(), tenantId, spaceId, releaseId, IdempotencyKeyFilter.require(request)));
    }

    @PatchMapping(
            value = "/releases/{releaseId}",
            consumes = {MERGE_PATCH, MediaType.APPLICATION_JSON_VALUE})
    @Operation(operationId = "patchRelease", summary = "Merge-patch Release label and notes")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> patch(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID releaseId,
            @RequestBody PatchReleaseRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(patchReleaseUseCase.patchRelease(
                bearer.require(), tenantId, spaceId, releaseId, body.patch(), IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/retention")
    @Operation(operationId = "setRetention", summary = "Set how many archived Releases to keep")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @RetentionResponses
    ResponseEntity<String> retention(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody RetentionRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(setRetentionUseCase.setRetention(
                bearer.require(), tenantId, spaceId, body.keep(), IdempotencyKeyFilter.require(request)));
    }

    record RetentionRequest(@NotNull @Min(1) @Max(50) Integer keep) {}

    @Schema(name = "PatchReleaseRequest", description = "JSON Merge Patch: omitted keeps")
    static final class PatchReleaseRequest {
        private boolean labelPresent;
        private boolean notesPresent;
        private String label;
        private String notes;

        @JsonSetter("label")
        public void setLabel(String value) {
            labelPresent = true;
            label = value;
        }

        @JsonSetter("notes")
        public void setNotes(String value) {
            notesPresent = true;
            notes = value;
        }

        @JsonProperty("label")
        @Schema(nullable = true, maxLength = 32)
        public String label() {
            return label;
        }

        @JsonProperty("notes")
        @Schema(nullable = true)
        public String notes() {
            return notes;
        }

        ReleaseTypes.ReleasePatch patch() {
            return ReleaseTypes.ReleasePatch.fromJson(labelPresent, label, notesPresent, notes);
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
                                schema = @Schema(implementation = ReleaseContract.DetailResponse.class))),
        @ApiResponse(responseCode = "400", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "409", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "422", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface MutationResponses {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ReleaseContract.BuildResponse.class))),
        @ApiResponse(responseCode = "400", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "409", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "422", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface BuildResponses {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = SpaceContract.DetailResponse.class))),
        @ApiResponse(responseCode = "400", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "409", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "422", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface RetentionResponses {}
}
