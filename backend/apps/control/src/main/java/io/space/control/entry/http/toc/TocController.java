package io.space.control.entry.http.toc;

import io.space.control.compositions.authoring.tocediting.AddEntryUseCase;
import io.space.control.compositions.authoring.tocediting.MoveEntryUseCase;
import io.space.control.compositions.authoring.tocediting.RelabelEntryUseCase;
import io.space.control.compositions.authoring.tocediting.RemoveEntryUseCase;
import io.space.control.compositions.authoring.tocediting.ViewTocUseCase;
import io.space.control.entry.http.problem.ApiProblem;
import io.space.control.entry.http.security.BearerCredential;
import io.space.control.entry.http.security.IdempotencyKeyFilter;
import io.space.control.entry.http.security.IdempotentReplay;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 目录编排端点：只做 DTO ↔ flow 翻译；四写均强制 Idempotency-Key，成功回整棵 TocView。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries")
class TocController {
    private final ViewTocUseCase viewTocUseCase;
    private final AddEntryUseCase addEntryUseCase;
    private final MoveEntryUseCase moveEntryUseCase;
    private final RelabelEntryUseCase relabelEntryUseCase;
    private final RemoveEntryUseCase removeEntryUseCase;
    private final BearerCredential bearer;

    TocController(
            ViewTocUseCase viewTocUseCase,
            AddEntryUseCase addEntryUseCase,
            MoveEntryUseCase moveEntryUseCase,
            RelabelEntryUseCase relabelEntryUseCase,
            RemoveEntryUseCase removeEntryUseCase,
            BearerCredential bearer) {
        this.viewTocUseCase = viewTocUseCase;
        this.addEntryUseCase = addEntryUseCase;
        this.moveEntryUseCase = moveEntryUseCase;
        this.relabelEntryUseCase = relabelEntryUseCase;
        this.removeEntryUseCase = removeEntryUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(operationId = "viewToc", summary = "Read the Space directory tree in author order")
    TocContract.TocResponse view(@PathVariable UUID tenantId, @PathVariable UUID spaceId) {
        return TocContract.TocResponse.from(viewTocUseCase.viewToc(bearer.require(), tenantId, spaceId));
    }

    @PostMapping
    @Operation(operationId = "addTocEntry", summary = "Add a directory entry")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @TocMutationResponses
    @ApiResponse(
            responseCode = "201",
            content =
                    @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = TocContract.TocResponse.class)))
    ResponseEntity<String> add(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody AddEntryRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(addEntryUseCase.addEntry(
                bearer.require(),
                tenantId,
                spaceId,
                body.parentId(),
                body.label(),
                body.kind(),
                body.targetId(),
                body.url(),
                body.position(),
                IdempotencyKeyFilter.require(request)));
    }

    @PatchMapping("/{entryId}")
    @Operation(operationId = "relabelTocEntry", summary = "Rename a directory entry")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @TocMutationResponses
    ResponseEntity<String> relabel(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID entryId,
            @Valid @RequestBody RelabelRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(relabelEntryUseCase.relabelEntry(
                bearer.require(), tenantId, spaceId, entryId, body.label(), IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/{entryId}:move")
    @Operation(operationId = "moveTocEntry", summary = "Move a directory entry")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @TocMutationResponses
    ResponseEntity<String> move(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID entryId,
            @Valid @RequestBody MoveRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(moveEntryUseCase.moveEntry(
                bearer.require(),
                tenantId,
                spaceId,
                entryId,
                body.parentId(),
                body.position(),
                IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/{entryId}")
    @Operation(operationId = "removeTocEntry", summary = "Remove a directory entry and its descendants")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @TocMutationResponses
    ResponseEntity<String> remove(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID entryId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(removeEntryUseCase.removeEntry(
                bearer.require(), tenantId, spaceId, entryId, IdempotencyKeyFilter.require(request)));
    }

    record AddEntryRequest(
            UUID parentId,
            @NotBlank @Size(max = 200) String label,
            @NotBlank @Pattern(regexp = "target|group|link") String kind,
            UUID targetId,
            @Size(max = 2048) String url,
            @Min(0) Integer position) {}

    record RelabelRequest(@NotBlank @Size(max = 200) String label) {}

    record MoveRequest(UUID parentId, @NotNull @Min(0) Integer position) {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = TocContract.TocResponse.class))),
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
    @interface TocMutationResponses {}
}
