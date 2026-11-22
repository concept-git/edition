package io.edition.control.adapters.inbound.http.problem;

import io.edition.control.usecases.flow.ProblemCode;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;

/**
 * problem-code → HTTP 形态（status / title / detail）的唯一映射表。
 *
 * <p>sync 只声明 {@link ProblemCode}；把 code 翻译成状态码与文案是 HTTP 适配层的职责，因此表放在这里。
 * 每个 catalog 项必须有一行——类加载即校验完整性，{@code ProblemContractParityTest} 再从字节码
 * 反向审计每个 code 都在 gateway 被引用。新增 error case = SYNCS.md 一行 + 异常子类一行 + 本表一行。
 */
final class ProblemCatalog {

    private static final Map<ProblemCode, Spec> SPECS = new EnumMap<>(ProblemCode.class);

    static {
        put(
                ProblemCode.SPACE_NOT_ARCHIVED,
                HttpStatus.CONFLICT,
                "space_not_archived",
                "Archive the Space before deleting it.");
        put(
                ProblemCode.DELETION_CONFIRMATION_INVALID,
                HttpStatus.CONFLICT,
                "deletion_confirmation_invalid",
                "The resource name changed or the confirmation does not match.");
        put(
                ProblemCode.RESOURCE_BUSY,
                HttpStatus.CONFLICT,
                "resource_busy",
                "An operation is still running. Retry after it finishes.");
        put(
                ProblemCode.WEBHOOK_DISABLED,
                HttpStatus.CONFLICT,
                "webhook_disabled",
                "Enable the subscription before redelivering.");
        put(
                ProblemCode.WEBHOOK_DELIVERY_NOT_REPLAYABLE,
                HttpStatus.CONFLICT,
                "webhook_delivery_not_replayable",
                "Only a completed or failed delivery can be redelivered.");
        // 认证与授权
        put(
                ProblemCode.INVALID_MANAGEMENT_TOKEN_SCOPE,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Management token scope invalid",
                "Choose a non-empty set of supported management task scopes. Platform scopes require an unrestricted platform operator credential.");
        put(
                ProblemCode.MANAGEMENT_SCOPE_REQUIRED,
                HttpStatus.FORBIDDEN,
                "Management scope required",
                "Configure a management credential with the required task scope. Inspect violations for the missing scope.");
        put(
                ProblemCode.AUTHENTICATION_REQUIRED,
                HttpStatus.UNAUTHORIZED,
                "Authentication required",
                "A valid Bearer credential is required.");
        put(
                ProblemCode.INVALID_CREDENTIALS,
                HttpStatus.UNAUTHORIZED,
                "Authentication rejected",
                "The supplied credential is invalid.");
        put(
                ProblemCode.INVALID_REFRESH,
                HttpStatus.UNAUTHORIZED,
                "Authentication rejected",
                "The supplied credential is invalid.");
        put(
                ProblemCode.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                "API token invalid",
                "The supplied API token is invalid, expired or revoked.");
        put(
                ProblemCode.PERMISSION_DENIED,
                HttpStatus.FORBIDDEN,
                "Permission denied",
                "The authenticated principal cannot perform this operation.");
        put(
                ProblemCode.PERMISSION_PRINCIPAL_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Permission principal not found",
                "The principal does not exist in this tenant.");
        put(
                ProblemCode.PERMISSION_PRINCIPAL_INACTIVE,
                HttpStatus.CONFLICT,
                "Permission principal inactive",
                "An inactive user cannot receive a new permission rule.");
        put(
                ProblemCode.PERMISSION_PRINCIPAL_TYPE_UNSUPPORTED,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Permission principal type unsupported",
                "This principal type is read-only in the permission management API.");
        put(
                ProblemCode.PERMISSION_ROLE_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Permission role invalid",
                "Choose one of the fixed permission roles.");
        put(
                ProblemCode.PERMISSION_RESTRICTION_TOO_LARGE,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Permission restriction too large",
                "A Page restriction can contain at most 100 principals.");
        put(
                ProblemCode.PERMISSION_VERSION_CONFLICT,
                HttpStatus.PRECONDITION_FAILED,
                "Permission version conflict",
                "Reload the current Page restriction and merge your changes.");
        put(
                ProblemCode.PLATFORM_OPERATOR_REQUIRED,
                HttpStatus.FORBIDDEN,
                "Platform operator required",
                "This endpoint is limited to platform operators.");
        put(
                ProblemCode.TENANT_SUSPENDED,
                HttpStatus.FORBIDDEN,
                "Tenant suspended",
                "This tenant is frozen; management operations are unavailable until it is resumed.");
        put(
                ProblemCode.CROSS_SITE_REQUEST_REJECTED,
                HttpStatus.FORBIDDEN,
                "Request rejected",
                "Login, refresh and logout require an allowed browser origin.");
        put(
                ProblemCode.ROLE_ESCALATION_FORBIDDEN,
                HttpStatus.FORBIDDEN,
                "Role escalation forbidden",
                "The selected role grants operations the issuer does not have.");
        put(
                ProblemCode.RATE_LIMITED,
                HttpStatus.TOO_MANY_REQUESTS,
                "Rate limited",
                "Too many authentication attempts.");
        put(
                ProblemCode.PASSWORD_LOCKED,
                HttpStatus.TOO_MANY_REQUESTS,
                "Password locked",
                "Wait before trying the current password again.");

        // 请求形态
        put(
                ProblemCode.VALIDATION_FAILED,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Validation failed",
                "One or more request fields are invalid.");
        put(
                ProblemCode.METHOD_NOT_ALLOWED,
                HttpStatus.METHOD_NOT_ALLOWED,
                "Method not allowed",
                "Use one of the methods listed in the Allow response header.");
        put(
                ProblemCode.MEDIA_TYPE_NOT_SUPPORTED,
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Unsupported media type",
                "Use a supported request Content-Type.");
        put(
                ProblemCode.RESPONSE_NOT_ACCEPTABLE,
                HttpStatus.NOT_ACCEPTABLE,
                "Response not acceptable",
                "Use a supported Accept media type.");
        put(
                ProblemCode.MALFORMED_JSON,
                HttpStatus.BAD_REQUEST,
                "Malformed JSON",
                "The request body is not valid JSON.");
        put(
                ProblemCode.RESOURCE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Resource not found",
                "The requested resource does not exist.");
        put(ProblemCode.INVALID_CURSOR, HttpStatus.BAD_REQUEST, "Invalid cursor", "The pagination cursor is invalid.");
        put(
                ProblemCode.INVALID_IDEMPOTENCY_KEY,
                HttpStatus.BAD_REQUEST,
                "Idempotency key required",
                "This endpoint requires an Idempotency-Key header.");
        put(
                ProblemCode.IDEMPOTENCY_KEY_REUSED,
                HttpStatus.CONFLICT,
                "Idempotency key reused",
                "This Idempotency-Key is already bound to a different request.");
        put(
                ProblemCode.IDEMPOTENCY_REQUEST_IN_PROGRESS,
                HttpStatus.CONFLICT,
                "Idempotent request in progress",
                "A request with this Idempotency-Key is still being processed; retry with the same key.");
        put(
                ProblemCode.PRECONDITION_REQUIRED,
                HttpStatus.PRECONDITION_REQUIRED,
                "Precondition required",
                "Supply the current strong resource ETag in If-Match.");
        put(
                ProblemCode.INVALID_PRECONDITION,
                HttpStatus.BAD_REQUEST,
                "Invalid precondition",
                "If-Match must use the strong ETag advertised by the resource, such as \"rev-N\" "
                        + "or \"permission-N\".");

        // 注册、登录与账户
        put(
                ProblemCode.EMAIL_TAKEN,
                HttpStatus.CONFLICT,
                "Email already registered",
                "This email address is already registered.");
        put(
                ProblemCode.PASSWORD_TOO_WEAK,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Password too weak",
                "Password strength requirements were not met.");
        put(
                ProblemCode.INVALID_OLD_PASSWORD,
                HttpStatus.BAD_REQUEST,
                "Old password invalid",
                "The current password is incorrect.");
        put(
                ProblemCode.RESET_TOKEN_INVALID,
                HttpStatus.BAD_REQUEST,
                "Reset token invalid",
                "The reset link is invalid, expired or already used.");
        put(
                ProblemCode.VERIFY_TOKEN_INVALID,
                HttpStatus.BAD_REQUEST,
                "Verification rejected",
                "The verification link is invalid, expired or already used.");
        put(
                ProblemCode.PROFILE_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Profile invalid",
                "One or more profile fields are invalid.");
        put(
                ProblemCode.ERASE_CONFIRMATION_INVALID,
                HttpStatus.BAD_REQUEST,
                "Erasure confirmation invalid",
                "The confirmation email or current password is invalid.");
        put(
                ProblemCode.USER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "User not found",
                "The requested global user does not exist.");
        put(
                ProblemCode.USER_ERASED,
                HttpStatus.CONFLICT,
                "User already erased",
                "An erased user cannot be deactivated or reactivated.");
        put(
                ProblemCode.USER_MUST_BE_DEACTIVATED,
                HttpStatus.CONFLICT,
                "User must be deactivated",
                "Deactivate the user before irreversible erasure.");
        put(
                ProblemCode.OWNERSHIP_TRANSFER_REQUIRED,
                HttpStatus.CONFLICT,
                "Ownership transfer required",
                "Transfer ownership of every listed group before erasing this user.");

        // 租户、成员与 Team
        put(
                ProblemCode.TENANT_NAME_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Tenant name invalid",
                "Tenant name must contain 1 to 120 characters.");
        put(
                ProblemCode.TENANT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Tenant not found",
                "The requested tenant does not exist.");
        put(
                ProblemCode.ALREADY_MEMBER,
                HttpStatus.CONFLICT,
                "Already a member",
                "This address already belongs to the group.");
        put(
                ProblemCode.INVITE_INVALID,
                HttpStatus.BAD_REQUEST,
                "Invitation rejected",
                "The invitation is invalid, expired or already used.");
        put(
                ProblemCode.INVITE_EXPIRED,
                HttpStatus.BAD_REQUEST,
                "Invitation expired",
                "The invitation has expired; ask an owner to issue a new one.");
        put(
                ProblemCode.INVITE_ALREADY_ACCEPTED,
                HttpStatus.CONFLICT,
                "Invitation already accepted",
                "This invitation has already been accepted.");
        put(
                ProblemCode.INVITE_EMAIL_MISMATCH,
                HttpStatus.CONFLICT,
                "Invitation address mismatch",
                "This invitation was issued to a different email address.");
        put(
                ProblemCode.TENANT_MEMBERSHIP_REQUIRED,
                HttpStatus.CONFLICT,
                "Tenant membership required",
                "Join the tenant before joining one of its teams.");
        put(
                ProblemCode.LAST_OWNER,
                HttpStatus.CONFLICT,
                "Last owner protected",
                "A group must keep at least one owner.");
        put(
                ProblemCode.TEAM_LAST_OWNER,
                HttpStatus.CONFLICT,
                "Team ownership transfer required",
                "Transfer ownership of every blocking team before removing this tenant member.");
        put(
                ProblemCode.MEMBER_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Member not found",
                "This user is not a member of the group.");
        put(
                ProblemCode.MEMBER_ROLE_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Member role invalid",
                "Member role must be owner or member.");
        put(
                ProblemCode.TEAM_NAME_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Team name invalid",
                "Team name must contain 1 to 120 characters.");
        put(
                ProblemCode.TEAM_NAME_TAKEN,
                HttpStatus.CONFLICT,
                "Team name taken",
                "A team with this normalized name already exists in the tenant.");
        put(
                ProblemCode.TEAM_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Team not found",
                "The requested team does not exist in this tenant.");

        // API 令牌
        put(
                ProblemCode.INVALID_TOKEN_SCOPE,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Token scope invalid",
                "Scopes must be a non-empty subset of read, write and publish.");
        put(
                ProblemCode.INVALID_TOKEN_EXPIRY,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Token expiry invalid",
                "Expiry must be in the future and no more than 365 days away.");
        put(
                ProblemCode.INVALID_TOKEN_ROLE,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Token role invalid",
                "The selected permission role does not exist.");
        put(
                ProblemCode.TENANT_SPACE_MISMATCH,
                HttpStatus.BAD_REQUEST,
                "Tenant and space mismatch",
                "The selected space does not belong to this tenant.");
        put(
                ProblemCode.TOKEN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Token not found",
                "The requested token does not exist in this tenant.");

        // 空间与页面
        put(
                ProblemCode.SITE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Site not found",
                "The requested site does not exist in this tenant.");
        put(
                ProblemCode.SITE_NOT_EMPTY,
                HttpStatus.CONFLICT,
                "Site not empty",
                "Unmount every space before deleting this site.");
        put(
                ProblemCode.SITE_HAS_DOMAINS,
                HttpStatus.CONFLICT,
                "Site has domains",
                "Unbind every custom domain before deleting this site.");
        put(ProblemCode.DOMAIN_TAKEN, HttpStatus.CONFLICT, "Domain taken", "This host is already bound to a site.");
        put(
                ProblemCode.NOT_PROVEN,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Domain not proven",
                "The TXT record does not match the stored challenge.");
        put(
                ProblemCode.DOMAIN_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Domain not found",
                "This host is not bound to the site.");
        put(
                ProblemCode.DOMAIN_NOT_VERIFIED,
                HttpStatus.CONFLICT,
                "Domain not verified",
                "Verify the host before making it primary.");
        put(
                ProblemCode.DOMAIN_IS_PRIMARY,
                HttpStatus.CONFLICT,
                "Domain is primary",
                "Choose another verified host as primary before unbinding this one.");
        put(
                ProblemCode.SITE_NAME_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Site name invalid",
                "Site name must contain 1 to 120 characters.");
        put(
                ProblemCode.SLUG_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Slug invalid",
                "Use letters, numbers and hyphens, 1 to 80 characters.");
        put(
                ProblemCode.SPACE_ALREADY_MOUNTED,
                HttpStatus.CONFLICT,
                "Space already mounted",
                "This space is already mounted on the site.");
        put(
                ProblemCode.HOME_NOT_MOUNTED,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Home is not mounted",
                "Home must be a space currently mounted on this site.");
        put(
                ProblemCode.ORDER_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Mount order invalid",
                "Order must be a permutation of the current mounts.");
        put(
                ProblemCode.BRANDING_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Branding invalid",
                "Use an https URL and a #rrggbb color.");
        put(
                ProblemCode.SPACE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Space not found",
                "The requested space does not exist in this tenant.");
        put(ProblemCode.SPACE_ARCHIVED, HttpStatus.CONFLICT, "Space archived", "Restore the space before changing it.");
        put(
                ProblemCode.SPACE_NAME_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Space name invalid",
                "Space name must contain 1 to 120 characters.");
        put(
                ProblemCode.SPACE_ICON_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Space icon invalid",
                "Choose one of the supported Space icons.");
        put(
                ProblemCode.SPACE_MODE_RESTRICTED,
                HttpStatus.CONFLICT,
                "Space mode is read-only",
                "This change is unavailable for a synced Space.");
        put(
                ProblemCode.LIVE_RELEASE_REQUIRED,
                HttpStatus.CONFLICT,
                "Live release required",
                "Convert to a synced Space after a live release exists.");
        put(
                ProblemCode.DEPTH_EXCEEDED,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Nesting too deep",
                "This move would exceed the maximum depth for this tree.");
        put(
                ProblemCode.CYCLE_DETECTED,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Cycle detected",
                "A node cannot be moved under itself or its descendants.");
        put(
                ProblemCode.POSITION_INVALID,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Position invalid",
                "The insert position is outside the sibling list.");
        put(
                ProblemCode.COLLECTION_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Collection not found",
                "The requested Collection does not exist in this tenant.");
        put(
                ProblemCode.COLLECTION_NOT_EMPTY,
                HttpStatus.CONFLICT,
                "Collection not empty",
                "Move spaces out and remove child groups before deleting this Collection.");
        put(
                ProblemCode.COLLECTION_NAME_TAKEN,
                HttpStatus.CONFLICT,
                "Collection name taken",
                "A sibling Collection already uses this name.");
        put(
                ProblemCode.TOC_ENTRY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Directory entry not found",
                "The requested directory entry does not exist in this Space.");
        put(ProblemCode.TAG_NOT_FOUND, HttpStatus.NOT_FOUND, "Tag not found", "No Page in this tenant uses that tag.");
        put(
                ProblemCode.TOO_MANY_TAGS,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Too many tags",
                "A Page holds at most 50 tags; remove one before adding another.");
        put(
                ProblemCode.PAGE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Page not found",
                "The requested Page does not exist in this tenant and Space.");
        put(
                ProblemCode.REVISION_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Revision not found",
                "The requested Revision does not exist for this Page.");
        put(ProblemCode.SLUG_TAKEN, HttpStatus.CONFLICT, "Slug already used", "Choose another slug for this Space.");
        put(
                ProblemCode.MOUNT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Mount not found",
                "That slug is not mounted on this site.");
        put(
                ProblemCode.REDIRECT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Redirect not found",
                "That redirect rule does not exist on this site.");
        put(
                ProblemCode.REDIRECT_NOT_MANUAL,
                HttpStatus.CONFLICT,
                "Redirect is automatic",
                "Automatic redirects cannot be deleted.");
        put(
                ProblemCode.REDIRECT_TARGET_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Redirect target not found",
                "The target must be a space mounted on this site or a page in one.");
        put(
                ProblemCode.EDIT_CONFLICT,
                HttpStatus.CONFLICT,
                "Edit conflict",
                "Merge your draft with the current Page content and retry with the new ETag.");
        put(
                ProblemCode.FILE_TOO_LARGE,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "File too large",
                "The uploaded file exceeds the allowed size.");
        put(
                ProblemCode.FILE_TYPE_UNSUPPORTED,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "File type unsupported",
                "Only PNG, JPEG, GIF, WebP and PDF attachments are accepted; the type is detected from the file content.");
        put(
                ProblemCode.TOO_MANY_ATTACHMENTS,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Too many attachments",
                "A Page holds at most 50 attachments; detach one before uploading.");
        put(
                ProblemCode.ATTACHMENT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Attachment not found",
                "The attachment does not exist on this Page or has been detached.");
        put(
                ProblemCode.EXPORT_NOT_READY,
                HttpStatus.CONFLICT,
                "Export not ready",
                "The complete export is not ready. Inspect its task status and retry if needed.");
        put(
                ProblemCode.EXPORT_EXPIRED,
                HttpStatus.GONE,
                "Export expired",
                "Generate another export from the retained release after checking current permissions.");
        put(
                ProblemCode.EXPORT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Export not found",
                "The export does not exist in this space.");
        put(
                ProblemCode.INVALID_BUNDLE,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Invalid bundle",
                "The release bundle does not match the published language contract.");
        put(
                ProblemCode.IMPORT_BLOCKED,
                HttpStatus.CONFLICT,
                "Import blocked",
                "Approve or discard the flagged import release before importing again.");
        put(
                ProblemCode.IMPORT_IN_PROGRESS,
                HttpStatus.CONFLICT,
                "Import in progress",
                "Wait for the current import job to finish before starting another.");
        put(
                ProblemCode.IMPORT_JOB_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Import job not found",
                "The requested import job does not exist in this Space.");
        put(
                ProblemCode.IMPORT_SOURCE_UNREACHABLE,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Import source unreachable",
                "The remote address could not be fetched; check that it is public and serves a zip.");
        put(
                ProblemCode.IMPORT_SOURCE_FORBIDDEN,
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Import source not allowed",
                "Only public https addresses are fetched; private networks and excessive redirects are refused.");
        put(
                ProblemCode.RELEASE_NOT_FLAGGED,
                HttpStatus.CONFLICT,
                "Release not flagged",
                "Only a flagged import release can be approved.");
        put(
                ProblemCode.RELEASE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Release not found",
                "The requested release does not exist in this Space.");
        put(
                ProblemCode.RELEASE_NOT_ARCHIVED,
                HttpStatus.CONFLICT,
                "Release not archived",
                "Rollback requires an archived release.");
        put(
                ProblemCode.RELEASE_NOT_DISCARDABLE,
                HttpStatus.CONFLICT,
                "Release not discardable",
                "Only draft, flagged or validated releases can be discarded.");
        put(
                ProblemCode.RELEASE_NOT_PROMOTABLE,
                HttpStatus.CONFLICT,
                "Release not promotable",
                "Only validated or archived releases can become live.");

        // 依赖与未知故障
        put(
                ProblemCode.DEPENDENCY_TIMEOUT,
                HttpStatus.GATEWAY_TIMEOUT,
                "Dependency timed out",
                "A required dependency did not respond in time.");
        put(
                ProblemCode.DEPENDENCY_UNAVAILABLE,
                HttpStatus.SERVICE_UNAVAILABLE,
                "Dependency unavailable",
                "A required dependency is temporarily unavailable.");
        put(
                ProblemCode.UNEXPECTED_ERROR,
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected error",
                "The request could not be completed.");

        var missing = Arrays.stream(ProblemCode.values())
                .filter(code -> !SPECS.containsKey(code))
                .map(ProblemCode::value)
                .collect(Collectors.joining(", "));
        if (!missing.isEmpty()) {
            throw new IllegalStateException("ProblemCatalog lacks HTTP mappings for: " + missing);
        }
    }

    private ProblemCatalog() {}

    static Spec of(ProblemCode code) {
        return SPECS.get(code);
    }

    private static void put(ProblemCode code, HttpStatus status, String title, String detail) {
        SPECS.put(code, new Spec(status, title, detail));
    }

    record Spec(HttpStatus status, String title, String detail) {}
}
