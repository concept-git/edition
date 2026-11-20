package io.space.control.entry.http.token;

import io.space.control.compositions.iam.apitoken.ApiTokenTypes;
import io.space.control.compositions.iam.apitoken.IssueTokenUseCase;
import io.space.control.compositions.iam.apitoken.ListTokensUseCase;
import io.space.control.compositions.iam.apitoken.RevokeTokenUseCase;
import io.space.control.entry.http.security.BearerCredential;
import io.space.control.entry.http.security.IdempotencyKeyFilter;
import io.space.control.entry.http.security.IdempotentReplay;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/tokens")
class ApiTokenController {
    private final IssueTokenUseCase issueTokenUseCase;
    private final ListTokensUseCase listTokensUseCase;
    private final RevokeTokenUseCase revokeTokenUseCase;
    private final BearerCredential bearer;

    ApiTokenController(
            IssueTokenUseCase issueTokenUseCase,
            ListTokensUseCase listTokensUseCase,
            RevokeTokenUseCase revokeTokenUseCase,
            BearerCredential bearer) {
        this.issueTokenUseCase = issueTokenUseCase;
        this.listTokensUseCase = listTokensUseCase;
        this.revokeTokenUseCase = revokeTokenUseCase;
        this.bearer = bearer;
    }

    @PostMapping
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "201",
            description = "Token issued; secret appears only in this response",
            content =
                    @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ApiTokenTypes.IssuedToken.class)))
    ResponseEntity<String> issue(
            @PathVariable UUID tenantId,
            @Valid @RequestBody IssueTokenRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(issueTokenUseCase.issueToken(
                bearer.require(),
                IdempotencyKeyFilter.require(request),
                tenantId,
                body.name(),
                body.spaceId(),
                body.role(),
                body.scopes(),
                body.expiry()));
    }

    @GetMapping
    ApiTokenTypes.TokenPage list(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listTokensUseCase.listTokens(bearer.require(), tenantId, cursor, limit);
    }

    @DeleteMapping("/{tokenId}")
    ResponseEntity<Void> revoke(@PathVariable UUID tenantId, @PathVariable UUID tokenId) {
        revokeTokenUseCase.revokeToken(bearer.require(), tenantId, tokenId);
        return ResponseEntity.noContent().build();
    }

    record IssueTokenRequest(
            @NotBlank @Size(max = 120) String name,
            @NotNull UUID spaceId,
            @NotBlank @Size(max = 80) String role,

            @NotEmpty
            @io.swagger.v3.oas.annotations.media.ArraySchema(
                    schema = @Schema(allowableValues = {"read", "write", "publish"}))
            Set<@NotBlank String> scopes,

            @NotNull @Future Instant expiry) {}
}
