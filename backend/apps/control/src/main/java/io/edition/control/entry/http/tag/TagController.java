package io.edition.control.entry.http.tag;

import io.edition.control.compositions.authoring.tagging.ListTaggedPagesUseCase;
import io.edition.control.compositions.authoring.tagging.ListTagsUseCase;
import io.edition.control.compositions.authoring.tagging.RenameTagUseCase;
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
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 租户标签目录、聚合页与改名；打标/摘除在 PageController。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/tags")
class TagController {
    private final RenameTagUseCase renameTagUseCase;
    private final ListTagsUseCase listTagsUseCase;
    private final ListTaggedPagesUseCase listTaggedPagesUseCase;
    private final BearerCredential bearer;

    TagController(
            RenameTagUseCase renameTagUseCase,
            ListTagsUseCase listTagsUseCase,
            ListTaggedPagesUseCase listTaggedPagesUseCase,
            BearerCredential bearer) {
        this.renameTagUseCase = renameTagUseCase;
        this.listTagsUseCase = listTagsUseCase;
        this.listTaggedPagesUseCase = listTaggedPagesUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(operationId = "listTags", summary = "List visible tags in a tenant with observer-relative pageCount")
    TagContract.CatalogResponse list(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return TagContract.CatalogResponse.from(listTagsUseCase.listTags(bearer.require(), tenantId, q, cursor, limit));
    }

    @GetMapping("/{label}/pages")
    @Operation(operationId = "listTaggedPages", summary = "List readable Pages that carry a tag")
    TagContract.TaggedPageResponse pages(
            @PathVariable UUID tenantId,
            @PathVariable String label,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return TagContract.TaggedPageResponse.from(
                listTaggedPagesUseCase.listTaggedPages(bearer.require(), tenantId, label, cursor, limit));
    }

    @PostMapping("/{label}:rename")
    @Operation(operationId = "renameTag", summary = "Rename a tag across the tenant; merge if the target exists")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = TagContract.RenameResponse.class))),
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
    ResponseEntity<String> rename(
            @PathVariable UUID tenantId,
            @PathVariable String label,
            @Valid @RequestBody RenameRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(renameTagUseCase.renameTag(
                bearer.require(), tenantId, label, body.to(), IdempotencyKeyFilter.require(request)));
    }

    record RenameRequest(@NotBlank @Size(max = 256) String to) {}
}
