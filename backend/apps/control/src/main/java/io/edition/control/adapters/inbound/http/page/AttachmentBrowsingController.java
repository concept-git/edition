package io.edition.control.adapters.inbound.http.page;

import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.usecases.authoring.attachmentbrowsing.AttachmentBrowsingTypes;
import io.edition.control.usecases.authoring.attachmentbrowsing.ListAttachmentsUseCase;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 只读空间附件入口；下载沿用页面端点的当前鉴权。 */
@RestController
class AttachmentBrowsingController {
    private final ListAttachmentsUseCase listAttachmentsUseCase;
    private final BearerCredential bearer;

    AttachmentBrowsingController(ListAttachmentsUseCase listAttachmentsUseCase, BearerCredential bearer) {
        this.listAttachmentsUseCase = listAttachmentsUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/api/v1/tenants/{tenantId}/spaces/{spaceId}/attachments")
    @Operation(
            operationId = "listSpaceAttachments",
            summary = "Browse readable working attachments with bounded scanning")
    AttachmentPageResponse list(
            @PathVariable UUID tenantId,
            @PathVariable UUID spaceId,
            @RequestParam(required = false) @Size(max = 2048) String cursor,
            @RequestParam(defaultValue = "30") @Min(1) @Max(100) int limit,
            @RequestParam(defaultValue = "") @Size(max = 200) String q,
            @RequestParam(defaultValue = "all") @Pattern(regexp = "all|image|pdf") String type) {
        return AttachmentPageResponse.from(
                listAttachmentsUseCase.listAttachments(bearer.require(), tenantId, spaceId, cursor, limit, q, type));
    }

    record AttachmentPageResponse(
            java.util.List<SpaceAttachmentResponse> items,

            @io.swagger.v3.oas.annotations.media.Schema(nullable = true)
            String nextCursor) {
        static AttachmentPageResponse from(AttachmentBrowsingTypes.Result result) {
            return new AttachmentPageResponse(
                    result.items().stream()
                            .map(item -> new SpaceAttachmentResponse(
                                    item.id(),
                                    item.pageId(),
                                    item.pageTitle(),
                                    item.filename(),
                                    item.mime(),
                                    item.sizeBytes(),
                                    item.createdAt()))
                            .toList(),
                    result.nextCursor());
        }
    }

    record SpaceAttachmentResponse(
            UUID id,
            UUID pageId,
            String pageTitle,
            String filename,
            String mime,
            long sizeBytes,
            java.time.Instant createdAt) {}
}
