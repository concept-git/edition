package io.edition.control.usecases.flow;

import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 对外稳定的 RFC 9457 problem-code catalog。
 *
 * <p>枚举名只供 Java 使用，线值保持 snake_case。每个 code 必须在 gateway 有真实生产映射；
 * 尚未开放但需要预留的契约项必须显式传入 {@code true}，由 ProblemContractParityTest 双向审计。
 * OpenAPI 由 springdoc 从本枚举生成，前端 union 再由 OpenAPI 生成。
 */
@Schema(enumAsRef = true)
public enum ProblemCode {
    SPACE_NOT_ARCHIVED("space_not_archived"),
    DELETION_CONFIRMATION_INVALID("deletion_confirmation_invalid"),
    RESOURCE_BUSY("resource_busy"),
    WEBHOOK_DISABLED("webhook_disabled"),
    WEBHOOK_DELIVERY_NOT_REPLAYABLE("webhook_delivery_not_replayable"),
    ALREADY_MEMBER("already_member"),
    ATTACHMENT_NOT_FOUND("attachment_not_found"),
    AUTHENTICATION_REQUIRED("authentication_required"),
    COLLECTION_NAME_TAKEN("collection_name_taken"),
    COLLECTION_NOT_EMPTY("collection_not_empty"),
    COLLECTION_NOT_FOUND("collection_not_found"),
    CROSS_SITE_REQUEST_REJECTED("cross_site_request_rejected"),
    CYCLE_DETECTED("cycle_detected"),
    DEPTH_EXCEEDED("depth_exceeded"),
    DOMAIN_IS_PRIMARY("domain_is_primary"),
    DOMAIN_NOT_FOUND("domain_not_found"),
    DOMAIN_NOT_VERIFIED("domain_not_verified"),
    DOMAIN_TAKEN("domain_taken"),
    DEPENDENCY_TIMEOUT("dependency_timeout"),
    DEPENDENCY_UNAVAILABLE("dependency_unavailable"),
    EMAIL_TAKEN("email_taken"),
    EDIT_CONFLICT("edit_conflict"),
    ERASE_CONFIRMATION_INVALID("erase_confirmation_invalid"),
    FILE_TOO_LARGE("file_too_large"),
    FILE_TYPE_UNSUPPORTED("file_type_unsupported"),
    INVALID_CREDENTIALS("invalid_credentials"),
    INVALID_CURSOR("invalid_cursor"),
    INVALID_IDEMPOTENCY_KEY("invalid_idempotency_key"),
    IDEMPOTENCY_KEY_REUSED("idempotency_key_reused"),
    IDEMPOTENCY_REQUEST_IN_PROGRESS("idempotency_request_in_progress"),
    INVALID_OLD_PASSWORD("invalid_old_password"),
    INVALID_PRECONDITION("invalid_precondition"),
    INVALID_REFRESH("invalid_refresh"),
    INVALID_TOKEN("invalid_token"),
    INVALID_TOKEN_EXPIRY("invalid_token_expiry"),
    INVALID_TOKEN_ROLE("invalid_token_role"),
    INVALID_TOKEN_SCOPE("invalid_token_scope"),
    INVALID_MANAGEMENT_TOKEN_SCOPE("invalid_management_token_scope"),
    MANAGEMENT_SCOPE_REQUIRED("management_scope_required"),
    INVITE_EMAIL_MISMATCH("invite_email_mismatch"),
    INVITE_EXPIRED("invite_expired"),
    INVITE_ALREADY_ACCEPTED("invite_already_accepted"),
    INVITE_INVALID("invite_invalid"),
    IMPORT_BLOCKED("import_blocked"),
    IMPORT_IN_PROGRESS("import_in_progress"),
    IMPORT_JOB_NOT_FOUND("import_job_not_found"),
    IMPORT_SOURCE_UNREACHABLE("import_source_unreachable"),
    IMPORT_SOURCE_FORBIDDEN("import_source_forbidden"),
    INVALID_BUNDLE("invalid_bundle"),
    EXPORT_NOT_READY("export_not_ready"),
    EXPORT_EXPIRED("export_expired"),
    EXPORT_NOT_FOUND("export_not_found"),
    LAST_OWNER("last_owner"),
    MALFORMED_JSON("malformed_json"),
    METHOD_NOT_ALLOWED("method_not_allowed"),
    MEDIA_TYPE_NOT_SUPPORTED("media_type_not_supported"),
    RESPONSE_NOT_ACCEPTABLE("response_not_acceptable"),
    MEMBER_NOT_FOUND("member_not_found"),
    MEMBER_ROLE_INVALID("member_role_invalid"),
    PASSWORD_LOCKED("password_locked"),
    PASSWORD_TOO_WEAK("password_too_weak"),
    OWNERSHIP_TRANSFER_REQUIRED("ownership_transfer_required"),
    NOT_PROVEN("not_proven"),
    PAGE_NOT_FOUND("page_not_found"),
    PERMISSION_DENIED("permission_denied"),
    PERMISSION_PRINCIPAL_INACTIVE("permission_principal_inactive"),
    PERMISSION_PRINCIPAL_NOT_FOUND("permission_principal_not_found"),
    PERMISSION_PRINCIPAL_TYPE_UNSUPPORTED("permission_principal_type_unsupported"),
    PERMISSION_RESTRICTION_TOO_LARGE("permission_restriction_too_large"),
    PERMISSION_ROLE_INVALID("permission_role_invalid"),
    PERMISSION_VERSION_CONFLICT("permission_version_conflict"),
    PLATFORM_OPERATOR_REQUIRED("platform_operator_required"),
    POSITION_INVALID("position_invalid"),
    PROFILE_INVALID("profile_invalid"),
    PRECONDITION_REQUIRED("precondition_required"),
    RATE_LIMITED("rate_limited"),
    RELEASE_NOT_ARCHIVED("release_not_archived"),
    RELEASE_NOT_DISCARDABLE("release_not_discardable"),
    RELEASE_NOT_FLAGGED("release_not_flagged"),
    RELEASE_NOT_FOUND("release_not_found"),
    RELEASE_NOT_PROMOTABLE("release_not_promotable"),
    RESET_TOKEN_INVALID("reset_token_invalid"),
    REVISION_NOT_FOUND("revision_not_found"),
    RESOURCE_NOT_FOUND("resource_not_found"),
    ROLE_ESCALATION_FORBIDDEN("role_escalation_forbidden"),
    SPACE_ARCHIVED("space_archived"),
    SPACE_ICON_INVALID("space_icon_invalid"),
    SPACE_NAME_INVALID("space_name_invalid"),
    SPACE_MODE_RESTRICTED("space_mode_restricted"),
    LIVE_RELEASE_REQUIRED("live_release_required"),
    SPACE_NOT_FOUND("space_not_found"),
    TENANT_NAME_INVALID("tenant_name_invalid"),
    TENANT_MEMBERSHIP_REQUIRED("tenant_membership_required"),
    TENANT_NOT_FOUND("tenant_not_found"),
    TENANT_SPACE_MISMATCH("tenant_space_mismatch"),
    TENANT_SUSPENDED("tenant_suspended"),
    TEAM_NAME_INVALID("team_name_invalid"),
    TEAM_NAME_TAKEN("team_name_taken"),
    TEAM_NOT_FOUND("team_not_found"),
    SITE_HAS_DOMAINS("site_has_domains"),
    SITE_NAME_INVALID("site_name_invalid"),
    SITE_NOT_EMPTY("site_not_empty"),
    SITE_NOT_FOUND("site_not_found"),
    SLUG_INVALID("slug_invalid"),
    SLUG_TAKEN("slug_taken"),
    MOUNT_NOT_FOUND("mount_not_found"),
    REDIRECT_NOT_FOUND("redirect_not_found"),
    REDIRECT_NOT_MANUAL("redirect_not_manual"),
    REDIRECT_TARGET_NOT_FOUND("redirect_target_not_found"),
    SPACE_ALREADY_MOUNTED("space_already_mounted"),
    HOME_NOT_MOUNTED("home_not_mounted"),
    ORDER_INVALID("order_invalid"),
    BRANDING_INVALID("branding_invalid"),
    TEAM_LAST_OWNER("team_last_owner"),
    TOKEN_NOT_FOUND("token_not_found"),
    TAG_NOT_FOUND("tag_not_found"),
    TOC_ENTRY_NOT_FOUND("toc_entry_not_found"),
    TOO_MANY_ATTACHMENTS("too_many_attachments"),
    TOO_MANY_TAGS("too_many_tags"),
    UNEXPECTED_ERROR("unexpected_error"),
    USER_ERASED("user_erased"),
    USER_MUST_BE_DEACTIVATED("user_must_be_deactivated"),
    USER_NOT_FOUND("user_not_found"),
    VALIDATION_FAILED("validation_failed"),
    VERIFY_TOKEN_INVALID("verify_token_invalid");

    private final String value;
    private final boolean reserved;

    ProblemCode(String value) {
        this(value, false);
    }

    ProblemCode(String value, boolean reserved) {
        this.value = value;
        this.reserved = reserved;
    }

    @JsonValue
    public String value() {
        return value;
    }

    public boolean reserved() {
        return reserved;
    }
}
