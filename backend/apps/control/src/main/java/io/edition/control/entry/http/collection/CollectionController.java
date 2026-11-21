package io.edition.control.entry.http.collection;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import io.edition.control.compositions.authoring.collection.CreateCollectionUseCase;
import io.edition.control.compositions.authoring.collection.MoveCollectionUseCase;
import io.edition.control.compositions.authoring.collection.PatchCollectionUseCase;
import io.edition.control.compositions.authoring.collection.PlaceSpaceUseCase;
import io.edition.control.compositions.authoring.collection.RemoveCollectionUseCase;
import io.edition.control.compositions.authoring.collection.UnplaceSpaceUseCase;
import io.edition.control.compositions.authoring.collection.ViewCollectionsUseCase;
import io.edition.control.entry.http.problem.ApiProblem;
import io.edition.control.entry.http.security.BearerCredential;
import io.edition.control.entry.http.security.IdempotencyKeyFilter;
import io.edition.control.entry.http.security.IdempotentReplay;
import io.edition.control.entry.http.space.SpaceContract;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
import org.springframework.web.bind.annotation.RestController;

/** 分组端点：只做 DTO ↔ flow 翻译；写均强制 Idempotency-Key。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/collections")
class CollectionController {
    private static final String MERGE_PATCH = "application/merge-patch+json";
    private final ViewCollectionsUseCase viewCollectionsUseCase;
    private final CreateCollectionUseCase createCollectionUseCase;
    private final PatchCollectionUseCase patchCollectionUseCase;
    private final MoveCollectionUseCase moveCollectionUseCase;
    private final RemoveCollectionUseCase removeCollectionUseCase;
    private final PlaceSpaceUseCase placeSpaceUseCase;
    private final UnplaceSpaceUseCase unplaceSpaceUseCase;
    private final BearerCredential bearer;

    CollectionController(
            ViewCollectionsUseCase viewCollectionsUseCase,
            CreateCollectionUseCase createCollectionUseCase,
            PatchCollectionUseCase patchCollectionUseCase,
            MoveCollectionUseCase moveCollectionUseCase,
            RemoveCollectionUseCase removeCollectionUseCase,
            PlaceSpaceUseCase placeSpaceUseCase,
            UnplaceSpaceUseCase unplaceSpaceUseCase,
            BearerCredential bearer) {
        this.viewCollectionsUseCase = viewCollectionsUseCase;
        this.createCollectionUseCase = createCollectionUseCase;
        this.patchCollectionUseCase = patchCollectionUseCase;
        this.moveCollectionUseCase = moveCollectionUseCase;
        this.removeCollectionUseCase = removeCollectionUseCase;
        this.placeSpaceUseCase = placeSpaceUseCase;
        this.unplaceSpaceUseCase = unplaceSpaceUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(operationId = "viewCollections", summary = "Read the tenant Collection forest in author order")
    CollectionContract.CollectionResponse view(@PathVariable UUID tenantId) {
        return CollectionContract.CollectionResponse.from(
                viewCollectionsUseCase.viewCollections(bearer.require(), tenantId));
    }

    @PostMapping
    @Operation(operationId = "createCollection", summary = "Create a Collection")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            content =
                    @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CollectionContract.CollectionResponse.class)))
    @MutationProblems
    ResponseEntity<String> create(
            @PathVariable UUID tenantId,
            @Valid @RequestBody CreateRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(createCollectionUseCase.createCollection(
                bearer.require(),
                tenantId,
                body.parentId(),
                body.name(),
                body.icon(),
                body.position(),
                IdempotencyKeyFilter.require(request)));
    }

    @PatchMapping(
            value = "/{collectionId}",
            consumes = {MERGE_PATCH, MediaType.APPLICATION_JSON_VALUE})
    @Operation(operationId = "patchCollection", summary = "Rename a Collection or set its icon")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @TreeMutation
    ResponseEntity<String> patch(
            @PathVariable UUID tenantId,
            @PathVariable UUID collectionId,
            @RequestBody PatchRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(patchCollectionUseCase.patchCollection(
                bearer.require(),
                tenantId,
                collectionId,
                body.namePresent,
                body.name,
                body.iconPresent,
                body.icon,
                IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/{collectionId}")
    @Operation(operationId = "removeCollection", summary = "Delete an empty Collection")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @TreeMutation
    ResponseEntity<String> remove(
            @PathVariable UUID tenantId,
            @PathVariable UUID collectionId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(removeCollectionUseCase.removeCollection(
                bearer.require(), tenantId, collectionId, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/{collectionId}:move")
    @Operation(operationId = "moveCollection", summary = "Move a Collection")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @TreeMutation
    ResponseEntity<String> move(
            @PathVariable UUID tenantId,
            @PathVariable UUID collectionId,
            @Valid @RequestBody MoveRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(moveCollectionUseCase.moveCollection(
                bearer.require(),
                tenantId,
                collectionId,
                body.parentId(),
                body.position(),
                IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/{collectionId}/spaces/{spaceId}")
    @Operation(operationId = "placeSpace", summary = "Place a Space into a Collection")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @SpaceMutation
    ResponseEntity<String> place(
            @PathVariable UUID tenantId,
            @PathVariable UUID collectionId,
            @PathVariable UUID spaceId,
            @RequestBody(required = false) PlaceRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        Integer position = body == null ? null : body.position();
        return IdempotentReplay.of(placeSpaceUseCase.placeSpace(
                bearer.require(), tenantId, collectionId, spaceId, position, IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/{collectionId}/spaces/{spaceId}")
    @Operation(operationId = "unplaceSpace", summary = "Remove a Space from this Collection if present")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @SpaceMutation
    ResponseEntity<String> unplace(
            @PathVariable UUID tenantId,
            @PathVariable UUID collectionId,
            @PathVariable UUID spaceId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(unplaceSpaceUseCase.unplaceSpace(
                bearer.require(), tenantId, collectionId, spaceId, IdempotencyKeyFilter.require(request)));
    }

    record CreateRequest(
            UUID parentId,
            @NotBlank @Size(max = 200) String name,

            @Pattern(regexp = "book|code|api|guide|reference")
            String icon,

            @Min(0) Integer position) {}

    static final class PatchRequest {
        private boolean namePresent;
        private boolean iconPresent;
        private String name;
        private String icon;

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

        @JsonProperty("name")
        @Schema(nullable = true, maxLength = 200)
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
    }

    record MoveRequest(UUID parentId, @NotNull @Min(0) Integer position) {}

    record PlaceRequest(@Min(0) Integer position) {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = CollectionContract.CollectionResponse.class))),
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
    @interface TreeMutation {}

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
                responseCode = "422",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class)))
    })
    @interface SpaceMutation {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
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
    @interface MutationProblems {}
}
