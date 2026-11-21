package io.edition.control.entry.http.account;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.edition.control.compositions.iam.accountsession.AccountSessionTypes;
import io.edition.control.compositions.iam.accountsession.EndSessionUseCase;
import io.edition.control.compositions.iam.accountsession.ListSessionsUseCase;
import io.edition.control.compositions.iam.accountsession.ProfileUseCase;
import io.edition.control.compositions.iam.accountsession.UpdateProfileUseCase;
import io.edition.control.compositions.principal.UnresolvedPrincipalException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me")
@SecurityRequirement(name = "bearerAuth")
@ApiResponse(
        responseCode = "401",
        description = "Missing, expired or revoked session (authentication_required)",
        content =
                @Content(
                        mediaType = AccountController.PROBLEM,
                        schema = @Schema(ref = "#/components/schemas/ApiProblem")))
class AccountController {
    static final String PROBLEM = "application/problem+json";

    private final ProfileUseCase profileUseCase;
    private final UpdateProfileUseCase updateProfileUseCase;
    private final ListSessionsUseCase listSessionsUseCase;
    private final EndSessionUseCase endSessionUseCase;

    AccountController(
            ProfileUseCase profileUseCase,
            UpdateProfileUseCase updateProfileUseCase,
            ListSessionsUseCase listSessionsUseCase,
            EndSessionUseCase endSessionUseCase) {
        this.profileUseCase = profileUseCase;
        this.updateProfileUseCase = updateProfileUseCase;
        this.listSessionsUseCase = listSessionsUseCase;
        this.endSessionUseCase = endSessionUseCase;
    }

    @GetMapping
    @Operation(operationId = "getCurrentUser", summary = "Read the authenticated user's profile")
    @ApiResponse(responseCode = "200", description = "Current profile")
    AccountSessionTypes.Profile me(Authentication authentication) {
        return profileUseCase.profile(principal(authentication));
    }

    @PatchMapping
    @Operation(
            operationId = "updateCurrentUser",
            summary = "Replace the authenticated user's profile",
            description =
                    "Deprecated full replacement: name is required, an omitted locale or avatar clears the stored value. Use PUT /me with all fields explicit.",
            deprecated = true)
    @ApiResponse(responseCode = "200", description = "Updated profile")
    @ApiResponse(
            responseCode = "422",
            description = "Blank name or non-HTTPS avatar (profile_invalid)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    AccountSessionTypes.Profile update(
            Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return updateProfileUseCase.updateProfile(
                principal(authentication), request.name(), request.locale(), request.avatar());
    }

    @PutMapping
    @Operation(
            operationId = "replaceCurrentUser",
            summary = "Replace the authenticated user's complete profile",
            description =
                    "All fields must be present. Explicit null clears locale or avatar; omitted fields are rejected without changing the profile.")
    @ApiResponse(responseCode = "200", description = "Replaced profile")
    @ApiResponse(responseCode = "400", description = "A required replacement field is missing")
    @ApiResponse(
            responseCode = "422",
            description = "Blank name or non-HTTPS avatar (profile_invalid)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    AccountSessionTypes.Profile replace(
            Authentication authentication, @Valid @RequestBody ReplaceProfileRequest request) {
        return updateProfileUseCase.updateProfile(
                principal(authentication), request.name(), request.locale(), request.avatar());
    }

    @GetMapping("/sessions")
    @Operation(
            operationId = "listSessions",
            summary = "List the authenticated user's device sessions",
            description = "Cursor paginated by last activity. The cursor is opaque; pass nextCursor verbatim.")
    @ApiResponse(responseCode = "200", description = "One page of device sessions")
    @ApiResponse(
            responseCode = "400",
            description = "Malformed cursor (invalid_cursor)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    AccountSessionTypes.Sessions sessions(
            Authentication authentication,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return listSessionsUseCase.listSessions(principal(authentication), cursor, limit, session(authentication));
    }

    @DeleteMapping("/sessions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "endSession",
            summary = "Revoke one of the authenticated user's sessions",
            description = "Idempotent, and limited to the caller's own sessions. Revoking the current "
                    + "session logs this device out immediately.")
    void end(Authentication authentication, @PathVariable UUID id) {
        endSessionUseCase.endSession(principal(authentication), id);
    }

    private UUID principal(Authentication authentication) {
        return claim(authentication, jwt -> jwt.getSubject());
    }

    private UUID session(Authentication authentication) {
        return claim(authentication, jwt -> jwt.getClaimAsString("sid"));
    }

    /** 缺少 sub/sid 的 bearer 不是本系统签发的会话凭据：按未认证处理，而非 500。 */
    private UUID claim(Authentication authentication, Function<Jwt, String> read) {
        if (!(authentication instanceof JwtAuthenticationToken token)) throw new UnresolvedPrincipalException();
        try {
            return UUID.fromString(Objects.requireNonNull(read.apply(token.getToken())));
        } catch (NullPointerException | IllegalArgumentException unusable) {
            throw new UnresolvedPrincipalException();
        }
    }

    record UpdateProfileRequest(@NotBlank String name, String locale, String avatar) {}

    record ReplaceProfileRequest(
            @JsonProperty(required = true) @NotBlank String name,

            @JsonProperty(required = true) @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String locale,

            @JsonProperty(required = true) @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true)
            String avatar) {}
}
