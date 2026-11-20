package io.space.control.entry.http.page;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import io.space.content.DocumentFormat;
import io.space.control.compositions.authoring.deletion.ListTrashUseCase;
import io.space.control.compositions.authoring.deletion.RestorePageUseCase;
import io.space.control.compositions.authoring.deletion.TrashPageUseCase;
import io.space.control.compositions.authoring.pageediting.AttachUseCase;
import io.space.control.compositions.authoring.pageediting.BatchGetPagesOnCompletion;
import io.space.control.compositions.authoring.pageediting.CreatePageUseCase;
import io.space.control.compositions.authoring.pageediting.DetachUseCase;
import io.space.control.compositions.authoring.pageediting.DiffRevisionsUseCase;
import io.space.control.compositions.authoring.pageediting.DownloadAttachmentUseCase;
import io.space.control.compositions.authoring.pageediting.EditPageUseCase;
import io.space.control.compositions.authoring.pageediting.ListPagesUseCase;
import io.space.control.compositions.authoring.pageediting.ListRevisionsUseCase;
import io.space.control.compositions.authoring.pageediting.PageEditingTypes;
import io.space.control.compositions.authoring.pageediting.PreviewPageUseCase;
import io.space.control.compositions.authoring.pageediting.RemovePropertyUseCase;
import io.space.control.compositions.authoring.pageediting.RenamePageUseCase;
import io.space.control.compositions.authoring.pageediting.RevertPageUseCase;
import io.space.control.compositions.authoring.pageediting.SetIconUseCase;
import io.space.control.compositions.authoring.pageediting.SetPropertyUseCase;
import io.space.control.compositions.authoring.pageediting.SetSeoUseCase;
import io.space.control.compositions.authoring.pageediting.ViewAttachmentUseCase;
import io.space.control.compositions.authoring.pageediting.ViewPageContentUseCase;
import io.space.control.compositions.authoring.pageediting.ViewPageUseCase;
import io.space.control.compositions.authoring.pageediting.ViewRevisionUseCase;
import io.space.control.compositions.authoring.tagging.TagPageUseCase;
import io.space.control.compositions.authoring.tagging.UntagPageUseCase;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.ProblemCode;
import io.space.control.compositions.hosting.reorganization.ReslugPageUseCase;
import io.space.control.compositions.hosting.reorganization.TransferPageUseCase;
import io.space.control.compositions.releases.release.PublishPageUseCase;
import io.space.control.compositions.releases.release.PublishPagesUseCase;
import io.space.control.compositions.releases.release.ReleaseTypes;
import io.space.control.compositions.releases.release.UnpublishPageUseCase;
import io.space.control.compositions.releases.release.UnpublishPagesUseCase;
import io.space.control.entry.http.problem.GatewayProblemException;
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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.json.JsonMapper;

/** 页面创作端点：只做 DTO ↔ flow 翻译；If-Match/ETag 的 HTTP 形态由 {@link PageEtag} 负责。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/spaces/{spaceId}")
class PageController {
    private static final String MERGE_PATCH = "application/merge-patch+json";
    /** 与 Page 概念上限一致；这里只是提前拒绝，真正的不变量在概念内。 */
    private static final long PAGE_ATTACHMENT_MAX_BYTES = 10L * 1024 * 1024;

    private final ListPagesUseCase listPagesUseCase;
    private final ViewPageUseCase viewPageUseCase;
    private final ViewPageContentUseCase viewPageContentUseCase;
    private final BatchGetPagesOnCompletion batchGetPagesOnCompletion;
    private final CreatePageUseCase createPageUseCase;
    private final PreviewPageUseCase previewPageUseCase;
    private final RenamePageUseCase renamePageUseCase;
    private final EditPageUseCase editPageUseCase;
    private final ListRevisionsUseCase listRevisionsUseCase;
    private final ViewRevisionUseCase viewRevisionUseCase;
    private final DiffRevisionsUseCase diffRevisionsUseCase;
    private final RevertPageUseCase revertPageUseCase;
    private final SetSeoUseCase setSeoUseCase;
    private final SetIconUseCase setIconUseCase;
    private final SetPropertyUseCase setPropertyUseCase;
    private final RemovePropertyUseCase removePropertyUseCase;
    private final AttachUseCase attachUseCase;
    private final DetachUseCase detachUseCase;
    private final ViewAttachmentUseCase viewAttachmentUseCase;
    private final DownloadAttachmentUseCase downloadAttachmentUseCase;
    private final TrashPageUseCase trashPageUseCase;
    private final RestorePageUseCase restorePageUseCase;
    private final ListTrashUseCase listTrashUseCase;
    private final TagPageUseCase tagPageUseCase;
    private final UntagPageUseCase untagPageUseCase;
    private final PublishPageUseCase publishPageUseCase;
    private final UnpublishPageUseCase unpublishPageUseCase;
    private final PublishPagesUseCase publishPagesUseCase;
    private final UnpublishPagesUseCase unpublishPagesUseCase;
    private final ReslugPageUseCase reslugPageUseCase;
    private final TransferPageUseCase transferPageUseCase;
    private final BearerCredential bearer;
    private final JsonMapper json;

    PageController(
            ListPagesUseCase listPagesUseCase,
            ViewPageUseCase viewPageUseCase,
            ViewPageContentUseCase viewPageContentUseCase,
            BatchGetPagesOnCompletion batchGetPagesOnCompletion,
            CreatePageUseCase createPageUseCase,
            PreviewPageUseCase previewPageUseCase,
            RenamePageUseCase renamePageUseCase,
            EditPageUseCase editPageUseCase,
            ListRevisionsUseCase listRevisionsUseCase,
            ViewRevisionUseCase viewRevisionUseCase,
            DiffRevisionsUseCase diffRevisionsUseCase,
            RevertPageUseCase revertPageUseCase,
            SetSeoUseCase setSeoUseCase,
            SetIconUseCase setIconUseCase,
            SetPropertyUseCase setPropertyUseCase,
            RemovePropertyUseCase removePropertyUseCase,
            AttachUseCase attachUseCase,
            DetachUseCase detachUseCase,
            ViewAttachmentUseCase viewAttachmentUseCase,
            DownloadAttachmentUseCase downloadAttachmentUseCase,
            TrashPageUseCase trashPageUseCase,
            RestorePageUseCase restorePageUseCase,
            ListTrashUseCase listTrashUseCase,
            TagPageUseCase tagPageUseCase,
            UntagPageUseCase untagPageUseCase,
            PublishPageUseCase publishPageUseCase,
            UnpublishPageUseCase unpublishPageUseCase,
            PublishPagesUseCase publishPagesUseCase,
            UnpublishPagesUseCase unpublishPagesUseCase,
            ReslugPageUseCase reslugPageUseCase,
            TransferPageUseCase transferPageUseCase,
            BearerCredential bearer,
            JsonMapper json) {
        this.listPagesUseCase = listPagesUseCase;
        this.viewPageUseCase = viewPageUseCase;
        this.viewPageContentUseCase = viewPageContentUseCase;
        this.batchGetPagesOnCompletion = batchGetPagesOnCompletion;
        this.createPageUseCase = createPageUseCase;
        this.previewPageUseCase = previewPageUseCase;
        this.renamePageUseCase = renamePageUseCase;
        this.editPageUseCase = editPageUseCase;
        this.listRevisionsUseCase = listRevisionsUseCase;
        this.viewRevisionUseCase = viewRevisionUseCase;
        this.diffRevisionsUseCase = diffRevisionsUseCase;
        this.revertPageUseCase = revertPageUseCase;
        this.setSeoUseCase = setSeoUseCase;
        this.setIconUseCase = setIconUseCase;
        this.setPropertyUseCase = setPropertyUseCase;
        this.removePropertyUseCase = removePropertyUseCase;
        this.attachUseCase = attachUseCase;
        this.detachUseCase = detachUseCase;
        this.viewAttachmentUseCase = viewAttachmentUseCase;
        this.downloadAttachmentUseCase = downloadAttachmentUseCase;
        this.trashPageUseCase = trashPageUseCase;
        this.restorePageUseCase = restorePageUseCase;
        this.listTrashUseCase = listTrashUseCase;
        this.tagPageUseCase = tagPageUseCase;
        this.untagPageUseCase = untagPageUseCase;
        this.publishPageUseCase = publishPageUseCase;
        this.unpublishPageUseCase = unpublishPageUseCase;
        this.publishPagesUseCase = publishPagesUseCase;
        this.unpublishPagesUseCase = unpublishPagesUseCase;
        this.reslugPageUseCase = reslugPageUseCase;
        this.transferPageUseCase = transferPageUseCase;
        this.bearer = bearer;
        this.json = json;
    }

    @GetMapping("/pages")
    @Operation(operationId = "listPages", summary = "List readable Pages in a Space")
    PageContract.PageResponse list(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit,
            @RequestParam(required = false) @Pattern(regexp = "draft|published") String status,
            @RequestParam(required = false) @Pattern(regexp = DocumentFormat.WIRE_PATTERN) String format,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @Size(max = 200) String q,
            @Parameter(
                            description =
                                    "Select 1..100 distinct Page ids without pagination; cannot combine with limit, cursor or other filters")
                    @RequestParam(required = false)
                    @Size(min = 1, max = 100)
                    List<UUID> ids,
            @Parameter(hidden = true) HttpServletRequest request) {
        if (ids != null && request.getParameter("limit") != null)
            throw new PageEditingTypes.MetadataInvalidException("ids", "incompatible_filter");
        return PageContract.PageResponse.from(listPagesUseCase.listPages(
                bearer.require(), tenantId, spaceId, cursor, limit, status, format, tag, q, ids));
    }

    @GetMapping("/trash")
    @Operation(operationId = "listTrash", summary = "List trashed Pages in a Space")
    PageContract.TrashPageResponse listTrash(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return PageContract.TrashPageResponse.from(
                listTrashUseCase.listTrash(bearer.require(), tenantId, spaceId, cursor, limit));
    }

    @PostMapping("/pages")
    @Operation(operationId = "createPage", summary = "Create and place an authored Page")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            content =
                    @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = PageContract.DetailResponse.class)))
    ResponseEntity<String> create(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody CreatePageRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(createPageUseCase.createPage(
                bearer.require(),
                tenantId,
                spaceId,
                body.format(),
                body.title(),
                body.slug(),
                IdempotencyKeyFilter.require(request),
                body.profile()));
    }

    @PostMapping("/pages:preview")
    @Operation(operationId = "previewPage", summary = "Render a safe Page preview without persistence")
    PageContract.PreviewResponse preview(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @Valid @RequestBody PreviewPageRequest body) {
        return PageContract.PreviewResponse.from(
                previewPageUseCase.previewPage(bearer.require(), tenantId, spaceId, body.format(), body.content()));
    }

    @GetMapping("/pages/{pageId}")
    @Operation(
            operationId = "viewPage",
            summary = "Read one Page",
            description =
                    "ETag validates the complete response representation. X-Content-ETag is a legacy content-baseline bridge; read /content for atomic content and its ETag.")
    ResponseEntity<PageContract.DetailResponse> view(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @PathVariable UUID pageId) {
        var value = viewPageUseCase.viewPage(bearer.require(), tenantId, spaceId, pageId);
        return ResponseEntity.ok()
                .header(
                        "ETag",
                        PageEtag.representation(
                                value.revision(), json.writeValueAsString(PageContract.DetailResponse.from(value))))
                .header("X-Content-ETag", PageEtag.of(value.revision()))
                .body(PageContract.DetailResponse.from(value));
    }

    @GetMapping("/pages/{pageId}/content")
    @Operation(
            operationId = "viewPageContent",
            summary = "Read atomic Page content and its content ETag",
            description =
                    "The rev-N ETag covers content and its interpretation profile from one baseline; use it as If-Match when replacing content.")
    ResponseEntity<PageEditingTypes.ContentSnapshot> content(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @PathVariable UUID pageId) {
        var snapshot = viewPageContentUseCase.viewPageContent(bearer.require(), tenantId, spaceId, pageId);
        return ResponseEntity.ok()
                .header("ETag", PageEtag.of(snapshot.revision()))
                .body(snapshot);
    }

    @PostMapping("/pages:batchGet")
    @Operation(operationId = "batchGetPages", summary = "Read up to 100 selected Pages without writes; at most 4MiB")
    BatchPageResponse batchGet(
            @PathVariable UUID tenantId, @PathVariable UUID spaceId, @Valid @RequestBody BatchReadRequest body) {
        var result =
                batchGetPagesOnCompletion.batchGetPages(bearer.require(), tenantId, spaceId, body.ids(), body.view());
        var response = new BatchPageResponse(result.items().stream()
                .map(item -> new BatchPageItem(
                        item.id(),
                        item.status(),
                        item.page() == null ? null : PageContract.SummaryResponse.from(item.page()),
                        item.content(),
                        item.content() == null
                                ? null
                                : PageEtag.of(item.content().revision())))
                .toList());
        if (json.writeValueAsString(response).getBytes(StandardCharsets.UTF_8).length > 4 * 1024 * 1024)
            throw new PageEditingTypes.MetadataInvalidException("response", "too_large");
        return response;
    }

    @PostMapping("/pages:publish")
    @Operation(operationId = "publishPages", summary = "Atomically select up to 100 Pages for one publication pipeline")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = ReleaseTypes.BatchPublishResult.class)))
    ResponseEntity<String> publishBatch(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody PageIdsRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(publishPagesUseCase.publishPages(
                bearer.require(), tenantId, spaceId, body.ids(), IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/pages:unpublish")
    @Operation(
            operationId = "unpublishPages",
            summary = "Atomically deselect up to 100 Pages with one publication pipeline")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "200",
            content = @Content(schema = @Schema(implementation = ReleaseTypes.BatchPublishResult.class)))
    ResponseEntity<String> unpublishBatch(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @Valid @RequestBody PageIdsRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(unpublishPagesUseCase.unpublishPages(
                bearer.require(), tenantId, spaceId, body.ids(), IdempotencyKeyFilter.require(request)));
    }

    record PageIdsRequest(@NotNull @Size(min = 1, max = 100) List<@NotNull UUID> ids) {}

    record BatchReadRequest(
            @NotNull @Size(min = 1, max = 100) List<@NotNull UUID> ids,
            @NotNull PageEditingTypes.ReadView view) {}

    record BatchPageItem(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID id,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            PageEditingTypes.ReadStatus status,

            @Schema(nullable = true) PageContract.SummaryResponse page,
            @Schema(nullable = true) PageEditingTypes.ContentSnapshot content,
            @Schema(nullable = true) String etag) {}

    record BatchPageResponse(List<BatchPageItem> items) {}

    @PatchMapping(
            value = "/pages/{pageId}",
            consumes = {MERGE_PATCH, MediaType.APPLICATION_JSON_VALUE})
    @Operation(operationId = "renamePage", summary = "Rename a Page")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> rename(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Valid @RequestBody RenamePageRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(renamePageUseCase.renamePage(
                bearer.require(), tenantId, spaceId, pageId, body.title(), IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/pages/{pageId}/content")
    @Operation(operationId = "editPage", summary = "Replace Page content at a strong baseline")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @Parameter(
            name = "If-Match",
            in = ParameterIn.HEADER,
            required = true,
            description =
                    "Content ETag rev-N from GET /content. Legacy page-rev-N-SHA256 tags are accepted only as a deprecated content-baseline bridge.")
    @PageMutationResponses
    ResponseEntity<String> edit(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Valid @RequestBody EditPageRequest body,
            @RequestHeader(value = "If-Match", required = false) String ifMatch,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(editPageUseCase.editPage(
                bearer.require(),
                tenantId,
                spaceId,
                pageId,
                body.content(),
                PageEtag.revision(ifMatch),
                IdempotencyKeyFilter.require(request),
                body.profile(),
                body.intent()));
    }

    @GetMapping("/pages/{pageId}/revisions")
    @Operation(operationId = "listPageRevisions", summary = "List Page Revisions newest first")
    PageContract.RevisionPageResponse revisions(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return PageContract.RevisionPageResponse.from(
                listRevisionsUseCase.listRevisions(bearer.require(), tenantId, spaceId, pageId, cursor, limit));
    }

    @GetMapping("/pages/{pageId}/revisions/{revision}")
    @Operation(operationId = "viewPageRevision", summary = "Read one Page Revision")
    PageContract.RevisionDetailResponse revision(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @PathVariable @Min(1) int revision) {
        return PageContract.RevisionDetailResponse.from(
                viewRevisionUseCase.viewRevision(bearer.require(), tenantId, spaceId, pageId, revision));
    }

    @GetMapping("/pages/{pageId}/revisions:diff")
    @Operation(operationId = "diffPageRevisions", summary = "Compare two Page Revisions")
    PageContract.DiffResponse diff(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @RequestParam @Min(1) int from,
            @RequestParam @Min(1) int to) {
        return PageContract.DiffResponse.from(
                diffRevisionsUseCase.diffRevisions(bearer.require(), tenantId, spaceId, pageId, from, to));
    }

    @PostMapping("/pages/{pageId}:revert")
    @Operation(operationId = "revertPage", summary = "Save historical content as a new Revision")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @Parameter(
            name = "If-Match",
            in = ParameterIn.HEADER,
            required = true,
            description =
                    "Content ETag rev-N from GET /content. Legacy page-rev-N-SHA256 tags are accepted only as a deprecated content-baseline bridge.")
    @PageMutationResponses
    ResponseEntity<String> revert(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Valid @RequestBody RevertPageRequest body,
            @RequestHeader(value = "If-Match", required = false) String ifMatch,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(revertPageUseCase.revertPage(
                bearer.require(),
                tenantId,
                spaceId,
                pageId,
                body.n(),
                PageEtag.revision(ifMatch),
                IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/pages/{pageId}:trash")
    @Operation(operationId = "trashPage", summary = "Move a Page to trash without deleting it")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> trash(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(trashPageUseCase.trashPage(
                bearer.require(), tenantId, spaceId, pageId, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/pages/{pageId}:restore")
    @Operation(operationId = "restorePage", summary = "Restore a trashed Page without re-hanging the Toc")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> restore(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(restorePageUseCase.restorePage(
                bearer.require(), tenantId, spaceId, pageId, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/pages/{pageId}:reslug")
    @Operation(operationId = "reslugPage", summary = "Change a Page slug and register redirects")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> reslug(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Valid @RequestBody ReslugPageRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(reslugPageUseCase.reslugPage(
                bearer.require(), tenantId, spaceId, pageId, body.slug(), IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/pages/{pageId}:transfer")
    @Operation(operationId = "transferPage", summary = "Move a Page to another Space and register redirects")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> transfer(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Valid @RequestBody TransferPageRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(transferPageUseCase.transferPage(
                bearer.require(),
                tenantId,
                spaceId,
                pageId,
                body.toSpace(),
                body.slug(),
                IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/pages/{pageId}:publish")
    @Operation(operationId = "publishPage", summary = "Mark a Page published and auto-promote when wiki mode is on")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PublishResponses
    ResponseEntity<String> publish(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return publishMutation(publishPageUseCase.publishPage(
                bearer.require(), tenantId, spaceId, pageId, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/pages/{pageId}:unpublish")
    @Operation(operationId = "unpublishPage", summary = "Mark a Page unpublished and auto-promote when wiki mode is on")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PublishResponses
    ResponseEntity<String> unpublish(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Parameter(hidden = true) HttpServletRequest request) {
        return publishMutation(unpublishPageUseCase.unpublishPage(
                bearer.require(), tenantId, spaceId, pageId, IdempotencyKeyFilter.require(request)));
    }

    // ---- 页面元数据与附件（票 13）：不动内容基线，无 If-Match；响应仍带当前 ETag 便于编辑器同步 ----

    @PatchMapping(
            value = "/pages/{pageId}/seo",
            consumes = {MERGE_PATCH, MediaType.APPLICATION_JSON_VALUE})
    @Operation(operationId = "setPageSeo", summary = "Merge-patch Page SEO (TDK); omitted keeps, null clears")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> setSeo(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @RequestBody SeoPatchRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(setSeoUseCase.setSeo(
                bearer.require(), tenantId, spaceId, pageId, body.patch(), IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/pages/{pageId}/icon")
    @Operation(operationId = "setPageIcon", summary = "Set or clear the Page icon URL")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> setIcon(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @Valid @RequestBody SetIconRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(setIconUseCase.setIcon(
                bearer.require(), tenantId, spaceId, pageId, body.icon(), IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/pages/{pageId}/properties/{field}")
    @Operation(operationId = "setPageProperty", summary = "Upsert one free-form Page property")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> setProperty(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @PathVariable @Size(min = 1, max = 64) String field,
            @Valid @RequestBody SetPropertyRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(setPropertyUseCase.setProperty(
                bearer.require(),
                tenantId,
                spaceId,
                pageId,
                field,
                body.value(),
                IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/pages/{pageId}/properties/{field}")
    @Operation(operationId = "removePageProperty", summary = "Remove one Page property (idempotent)")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> removeProperty(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @PathVariable @Size(min = 1, max = 64) String field,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(removePropertyUseCase.removeProperty(
                bearer.require(), tenantId, spaceId, pageId, field, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping(value = "/pages/{pageId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            operationId = "attachPageFile",
            summary = "Upload one attachment (≤10 MiB; png/jpeg/gif/webp/pdf detected from content)")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = PageContract.DetailResponse.class))),
        @ApiResponse(responseCode = "400", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "409", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "422", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "503", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    ResponseEntity<String> attach(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @RequestPart("file") MultipartFile file,
            @Parameter(hidden = true) HttpServletRequest request)
            throws IOException {
        if (file.getSize() > PAGE_ATTACHMENT_MAX_BYTES) throw new FileTooLargeUploadException();
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        return mutation(attachUseCase.attach(
                bearer.require(),
                tenantId,
                spaceId,
                pageId,
                filename,
                file.getBytes(),
                IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/pages/{pageId}/attachments/{ref}")
    @Operation(operationId = "viewPageAttachment", summary = "Short-lived signed download URL for one attachment")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = PageContract.AttachmentLinkResponse.class))),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "503", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    PageContract.AttachmentLinkResponse viewAttachment(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @PathVariable UUID ref) {
        return PageContract.AttachmentLinkResponse.from(
                viewAttachmentUseCase.viewAttachment(bearer.require(), tenantId, spaceId, pageId, ref));
    }

    @DeleteMapping("/pages/{pageId}/attachments/{ref}")
    @Operation(operationId = "detachPageFile", summary = "Detach one attachment (reference only; idempotent)")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> detach(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @PathVariable UUID ref,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(detachUseCase.detach(
                bearer.require(), tenantId, spaceId, pageId, ref, IdempotencyKeyFilter.require(request)));
    }

    @PutMapping("/pages/{pageId}/tags/{label}")
    @Operation(operationId = "tagPage", summary = "Tag a Page; idempotent; does not bump revision")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> tag(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @PathVariable String label,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(tagPageUseCase.tagPage(
                bearer.require(), tenantId, spaceId, pageId, label, IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/pages/{pageId}/tags/{label}")
    @Operation(operationId = "untagPage", summary = "Remove a tag from a Page; missing labels are idempotent")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @PageMutationResponses
    ResponseEntity<String> untag(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @PathVariable String label,
            @Parameter(hidden = true) HttpServletRequest request) {
        return mutation(untagPageUseCase.untagPage(
                bearer.require(), tenantId, spaceId, pageId, label, IdempotencyKeyFilter.require(request)));
    }

    /** 成功写与重放都携带当前强 ETag，供下一次 If-Match。 */
    private static ResponseEntity<String> mutation(FlowResponse<PageEditingTypes.PageDetail> result) {
        return IdempotentReplay.builder(result)
                .header("ETag", PageEtag.representation(result.value().revision(), result.serializedBody()))
                .header("X-Content-ETag", PageEtag.of(result.value().revision()))
                .body(result.serializedBody());
    }

    private static ResponseEntity<String> publishMutation(FlowResponse<ReleaseTypes.PublishResult> result) {
        return IdempotentReplay.builder(result)
                .header("ETag", PageEtag.representation(result.value().page().revision(), result.serializedBody()))
                .header("X-Content-ETag", PageEtag.of(result.value().page().revision()))
                .body(result.serializedBody());
    }

    record CreatePageRequest(
            @NotBlank @Pattern(regexp = DocumentFormat.WIRE_PATTERN)
            String format,

            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 2048) String slug,
            String contentType,
            @Schema(nullable = true) String versionRef,
            Map<String, Object> interpretation) {
        io.space.content.ContentProfile profile() {
            return contentType == null && interpretation == null
                    ? null
                    : checkedProfile(format, contentType, versionRef, interpretation);
        }
    }

    record ReslugPageRequest(@NotBlank @Size(max = 2048) String slug) {}

    record TransferPageRequest(
            @NotNull UUID toSpace,
            @NotBlank @Size(max = 2048) String slug) {}

    record PreviewPageRequest(
            @NotBlank @Pattern(regexp = DocumentFormat.WIRE_PATTERN)
            String format,

            @NotNull String content) {}

    record RenamePageRequest(@NotBlank @Size(max = 200) String title) {}

    record EditPageRequest(
            @NotNull String content,
            String contentType,
            @Schema(nullable = true) String versionRef,
            Map<String, Object> interpretation,

            @Schema(nullable = true, description = "Explicit effect constraint; omitted only for legacy clients")
            PageEditingTypes.EditIntent intent) {
        io.space.content.ContentProfile profile() {
            if (contentType == null && interpretation == null) return null;
            if (contentType == null) throw new PageEditingTypes.MetadataInvalidException("contentType", "required");
            return checkedProfile("json", contentType, versionRef, interpretation);
        }
    }

    private static io.space.content.ContentProfile checkedProfile(
            String format, String contentType, String versionRef, Map<String, Object> interpretation) {
        try {
            return new io.space.content.ContentProfile(
                    contentType == null ? format.toLowerCase(java.util.Locale.ROOT) : contentType,
                    versionRef,
                    interpretation);
        } catch (IllegalArgumentException invalid) {
            throw new PageEditingTypes.MetadataInvalidException("interpretation", "invalid_content_profile");
        }
    }

    record RevertPageRequest(@Min(1) int n) {}

    @Schema(name = "SetPageIconRequest", description = "icon 为 http(s) URL；null 清空")
    record SetIconRequest(
            @Schema(nullable = true, maxLength = 2048) @Size(max = 2048)
            String icon) {}

    @Schema(name = "SetPagePropertyRequest")
    record SetPropertyRequest(@NotNull @Size(max = 4096) String value) {}

    /** JSON Merge Patch：字段出现即改（null 清空），省略保持；noIndex 出现时必须是 bool。 */
    @Schema(name = "PageSeoPatchRequest", description = "JSON Merge Patch: omitted keeps, null clears")
    static final class SeoPatchRequest {
        private boolean titlePresent;
        private boolean descriptionPresent;
        private boolean keywordsPresent;
        private boolean ogImagePresent;
        private String title;
        private String description;
        private String keywords;
        private String ogImage;
        private Boolean noIndex;

        @JsonSetter("title")
        public void setTitle(String value) {
            titlePresent = true;
            title = value;
        }

        @JsonSetter("description")
        public void setDescription(String value) {
            descriptionPresent = true;
            description = value;
        }

        @JsonSetter("keywords")
        public void setKeywords(String value) {
            keywordsPresent = true;
            keywords = value;
        }

        @JsonSetter("ogImage")
        public void setOgImage(String value) {
            ogImagePresent = true;
            ogImage = value;
        }

        @JsonSetter("noIndex")
        public void setNoIndex(Boolean value) {
            if (value == null) throw new IllegalArgumentException("noIndex must be a boolean");
            noIndex = value;
        }

        @JsonProperty("title")
        @Schema(nullable = true, maxLength = 200)
        public String title() {
            return title;
        }

        @JsonProperty("description")
        @Schema(nullable = true, maxLength = 500)
        public String description() {
            return description;
        }

        @JsonProperty("keywords")
        @Schema(nullable = true, maxLength = 500)
        public String keywords() {
            return keywords;
        }

        @JsonProperty("ogImage")
        @Schema(nullable = true, maxLength = 2048)
        public String ogImage() {
            return ogImage;
        }

        @JsonProperty("noIndex")
        @Schema(nullable = true)
        public Boolean noIndex() {
            return noIndex;
        }

        PageEditingTypes.SeoPatch patch() {
            return PageEditingTypes.SeoPatch.fromJson(
                    titlePresent,
                    title,
                    descriptionPresent,
                    description,
                    keywordsPresent,
                    keywords,
                    ogImagePresent,
                    ogImage,
                    noIndex);
        }
    }

    /** multipart 分片就已超过 Page 附件上限：与概念的 file_too_large 同一 code，不落成 500/400。 */
    static final class FileTooLargeUploadException extends GatewayProblemException {
        FileTooLargeUploadException() {
            super(ProblemCode.FILE_TOO_LARGE);
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
                                schema = @Schema(implementation = PageContract.DetailResponse.class))),
        @ApiResponse(responseCode = "400", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "409", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "422", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "428", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface PageMutationResponses {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = ReleaseTypes.PublishResult.class))),
        @ApiResponse(responseCode = "400", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "401", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "403", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "404", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "409", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE)),
        @ApiResponse(responseCode = "422", content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE))
    })
    @interface PublishResponses {}

    @GetMapping("/pages/{pageId}/attachments/{ref}/content")
    @Operation(operationId = "downloadPageAttachment", summary = "Download an attachment with current authorization")
    @ApiResponse(
            responseCode = "200",
            content =
                    @Content(
                            mediaType = "application/octet-stream",
                            schema = @Schema(type = "string", format = "binary")))
    ResponseEntity<org.springframework.core.io.Resource> downloadAttachment(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @PathVariable UUID pageId,
            @PathVariable UUID ref) {
        var file = downloadAttachmentUseCase.downloadAttachment(bearer.require(), tenantId, spaceId, pageId, ref);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.mime()))
                .contentLength(file.sizeBytes())
                .header("Cache-Control", "private, no-store")
                .header("X-Content-Type-Options", "nosniff")
                .header(
                        "Content-Disposition",
                        org.springframework.http.ContentDisposition.attachment()
                                .filename(file.filename(), java.nio.charset.StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .body(new org.springframework.core.io.InputStreamResource(file.stream()));
    }
}
