package io.edition.control.adapters.inbound.http.problem;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.edition.control.usecases.flow.ProblemCode;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/** 管理面统一错误载荷；code 稳定供前端映射，traceId 用于和结构化日志互查。 */
@Schema(description = "RFC 9457 error response")
public record ApiProblem(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String type,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String title,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int status,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) ProblemCode code,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String detail,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String traceId,

        @JsonInclude(JsonInclude.Include.NON_EMPTY)
        @Schema(description = "Field-level reasons that let the caller correct rejected input")
        List<Violation> violations,

        @JsonInclude(JsonInclude.Include.NON_EMPTY)
        @Schema(description = "Stable related resource ids for conflicts that require another resource to change")
        List<String> relatedIds,

        @JsonInclude(JsonInclude.Include.NON_EMPTY)
        @Schema(description = "Minimal group references that require ownership transfer before user erasure")
        List<RelatedGroup> relatedGroups,

        @JsonInclude(JsonInclude.Include.NON_NULL)
        @Schema(description = "Current Page baseline and content for a caller-resolvable edit conflict")
        Conflict conflict) {

    public ApiProblem {
        violations = violations == null ? null : List.copyOf(violations);
        relatedIds = relatedIds == null ? null : List.copyOf(relatedIds);
        relatedGroups = relatedGroups == null ? null : List.copyOf(relatedGroups);
    }

    static ApiProblem of(int status, ProblemCode code, String title, String detail, String traceId) {
        return new ApiProblem(
                "https://space.io/problems/" + code.value().replace('_', '-'),
                title,
                status,
                code,
                detail,
                traceId,
                null,
                null,
                null,
                null);
    }

    public ApiProblem withStatus(int status) {
        return new ApiProblem(
                type, title, status, code, detail, traceId, violations, relatedIds, relatedGroups, conflict);
    }

    public ApiProblem withViolation(String field, String code) {
        return new ApiProblem(
                type,
                title,
                status,
                this.code,
                detail,
                traceId,
                List.of(new Violation(field, code)),
                relatedIds,
                relatedGroups,
                conflict);
    }

    public ApiProblem withViolations(List<Violation> violations) {
        return new ApiProblem(
                type, title, status, code, detail, traceId, violations, relatedIds, relatedGroups, conflict);
    }

    public ApiProblem withRelatedIds(List<String> relatedIds) {
        return new ApiProblem(
                type, title, status, code, detail, traceId, violations, relatedIds, relatedGroups, conflict);
    }

    public ApiProblem withRelatedGroups(List<RelatedGroup> relatedGroups) {
        return new ApiProblem(
                type, title, status, code, detail, traceId, violations, relatedIds, relatedGroups, conflict);
    }

    public ApiProblem withConflict(Conflict value) {
        return new ApiProblem(type, title, status, code, detail, traceId, violations, relatedIds, relatedGroups, value);
    }

    public record Violation(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String field,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String code) {}

    public record RelatedGroup(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String type,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String id,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String tenantId,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String name) {}

    public record Conflict(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            int currentRevision,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String currentEtag,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            String theirs,

            @Schema(nullable = true) String currentContentType,
            @Schema(nullable = true) String currentVersionRef,

            @Schema(nullable = true, additionalProperties = Schema.AdditionalPropertiesValue.TRUE)
            java.util.Map<String, Object> currentInterpretation) {
        public Conflict(int currentRevision, String currentEtag, String theirs) {
            this(currentRevision, currentEtag, theirs, null, null, null);
        }
    }
}
