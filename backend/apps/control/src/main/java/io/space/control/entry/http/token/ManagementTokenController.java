package io.space.control.entry.http.token;

import io.space.control.compositions.iam.managementtoken.AuthenticationContextUseCase;
import io.space.control.compositions.iam.managementtoken.IssueManagementTokenUseCase;
import io.space.control.compositions.iam.managementtoken.ListManagementTokensUseCase;
import io.space.control.compositions.iam.managementtoken.ManagementTokenTypes;
import io.space.control.compositions.iam.managementtoken.RevokeManagementTokenUseCase;
import io.space.control.entry.http.security.BearerCredential;
import io.space.control.entry.http.security.IdempotencyKeyFilter;
import io.space.control.entry.http.security.IdempotentReplay;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.responses.ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Credential invalid or expired",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = io.space.control.entry.http.problem.ApiProblem.class))),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Credential type, scope or current permission denied",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = io.space.control.entry.http.problem.ApiProblem.class))),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "503",
            description = "Required dependency unavailable",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/problem+json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = io.space.control.entry.http.problem.ApiProblem.class)))
})
class ManagementTokenController {
    private final IssueManagementTokenUseCase issueManagementTokenUseCase;
    private final ListManagementTokensUseCase listManagementTokensUseCase;
    private final RevokeManagementTokenUseCase revokeManagementTokenUseCase;
    private final AuthenticationContextUseCase authenticationContextUseCase;
    private final BearerCredential bearer;

    ManagementTokenController(
            IssueManagementTokenUseCase issueManagementTokenUseCase,
            ListManagementTokensUseCase listManagementTokensUseCase,
            RevokeManagementTokenUseCase revokeManagementTokenUseCase,
            AuthenticationContextUseCase authenticationContextUseCase,
            BearerCredential bearer) {
        this.issueManagementTokenUseCase = issueManagementTokenUseCase;
        this.listManagementTokensUseCase = listManagementTokensUseCase;
        this.revokeManagementTokenUseCase = revokeManagementTokenUseCase;
        this.authenticationContextUseCase = authenticationContextUseCase;
        this.bearer = bearer;
    }

    @PostMapping("/api/v1/me/access-tokens")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "400",
                description = "Input or idempotency key invalid",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation =
                                                        io.space.control.entry.http.problem.ApiProblem.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "409",
                description = "Idempotency key reused for another request",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation =
                                                        io.space.control.entry.http.problem.ApiProblem.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "422",
                description = "Token scope or expiry rejected",
                content =
                        @io.swagger.v3.oas.annotations.media.Content(
                                mediaType = "application/problem+json",
                                schema =
                                        @io.swagger.v3.oas.annotations.media.Schema(
                                                implementation = io.space.control.entry.http.problem.ApiProblem.class)))
    })
    @Operation(
            operationId = "issueManagementToken",
            summary = "Issue a scoped personal management credential; session only")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Secret returned only in this logical issuance response",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ManagementTokenTypes.IssuedManagementToken.class)))
    ResponseEntity<String> issue(@Valid @RequestBody IssueRequest body, HttpServletRequest request) {
        var result = issueManagementTokenUseCase.issueManagementToken(
                bearer.require(),
                IdempotencyKeyFilter.require(request),
                body.name(),
                body.scopes(),
                body.tenantId(),
                body.expiry());
        return IdempotentReplay.builder(result)
                .header("Cache-Control", "no-store")
                .body(result.serializedBody());
    }

    @GetMapping("/api/v1/me/access-tokens")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Own credential metadata without secrets",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation = ManagementTokenTypes.ManagementTokenPage.class)))
    @Operation(
            operationId = "listManagementTokens",
            summary = "List own personal management credentials without secrets; session only")
    ManagementTokenTypes.ManagementTokenPage list(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listManagementTokensUseCase.listManagementTokens(bearer.require(), cursor, limit);
    }

    @DeleteMapping("/api/v1/me/access-tokens/{tokenId}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "204",
            description = "Credential revoked or absent")
    @Operation(
            operationId = "revokeManagementToken",
            summary = "Revoke own management credential; missing credentials are idempotent")
    ResponseEntity<Void> revoke(@PathVariable UUID tokenId) {
        revokeManagementTokenUseCase.revokeManagementToken(bearer.require(), tokenId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/auth/context")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Authenticated actor and credential limits",
            content =
                    @io.swagger.v3.oas.annotations.media.Content(
                            mediaType = "application/json",
                            schema =
                                    @io.swagger.v3.oas.annotations.media.Schema(
                                            implementation =
                                                    ManagementTokenTypes.ManagementAuthenticationContext.class)))
    @Operation(
            operationId = "authenticationContext",
            summary = "Inspect current credential limits without returning any secret")
    ManagementTokenTypes.ManagementAuthenticationContext context() {
        return authenticationContextUseCase.authenticationContext(bearer.require());
    }

    record IssueRequest(
            @NotBlank @Size(max = 120) String name,
            @NotEmpty Set<@NotBlank String> scopes,

            @io.swagger.v3.oas.annotations.media.Schema(nullable = true)
            UUID tenantId,

            @NotNull @Future Instant expiry) {}
}
