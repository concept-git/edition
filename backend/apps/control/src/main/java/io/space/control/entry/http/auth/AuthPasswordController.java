package io.space.control.entry.http.auth;

import io.space.control.compositions.iam.accountsecurity.ChangePasswordUseCase;
import io.space.control.compositions.iam.accountsecurity.ForgotUseCase;
import io.space.control.compositions.iam.accountsecurity.ResetByTokenUseCase;
import io.space.control.compositions.principal.UnresolvedPrincipalException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

/** 账户安全联动的三个 HTTP 入口；只做 DTO、限流与 flow 翻译。 */
@RestController
class AuthPasswordController {
    private static final String PROBLEM = "application/problem+json";
    private static final String PROBLEM_SCHEMA = "#/components/schemas/ApiProblem";
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final ChangePasswordUseCase changePasswordUseCase;
    private final ForgotUseCase forgotUseCase;
    private final ResetByTokenUseCase resetByTokenUseCase;
    private final AuthenticationRateLimiter limits;
    private final Set<String> trustedProxies;

    AuthPasswordController(
            ChangePasswordUseCase changePasswordUseCase,
            ForgotUseCase forgotUseCase,
            ResetByTokenUseCase resetByTokenUseCase,
            AuthenticationRateLimiter limits,
            @Value("${security.trusted-proxies:127.0.0.1,::1}") List<String> trustedProxies) {
        this.changePasswordUseCase = changePasswordUseCase;
        this.forgotUseCase = forgotUseCase;
        this.resetByTokenUseCase = resetByTokenUseCase;
        this.limits = limits;
        this.trustedProxies = Set.copyOf(trustedProxies);
    }

    @PostMapping("/api/v1/me/password:change")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(operationId = "changePassword", summary = "Change the authenticated user's password")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Password changed; all sessions ended"),
        @ApiResponse(
                responseCode = "400",
                description = "Old password invalid (invalid_old_password)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA))),
        @ApiResponse(
                responseCode = "422",
                description = "New password too weak (password_too_weak)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA))),
        @ApiResponse(
                responseCode = "429",
                description = "Password locked (password_locked)",
                headers =
                        @Header(
                                name = "Retry-After",
                                description = "Seconds until the current password may be attempted again",
                                schema = @Schema(type = "integer", format = "int64")),
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA)))
    })
    void change(Authentication authentication, @Valid @RequestBody ChangeRequest body, HttpServletResponse response) {
        changePasswordUseCase.changePassword(principal(authentication), body.oldPassword(), body.newPassword());
        RefreshCookie.clear(response);
    }

    @PostMapping("/auth/password:forgot")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(
            operationId = "forgotPassword",
            summary = "Request a password reset",
            description = "Always returns the same accepted response for unknown, inactive and active accounts.")
    @ApiResponses({
        @ApiResponse(responseCode = "202", description = "Request accepted"),
        @ApiResponse(
                responseCode = "400",
                description = "Invalid email (validation_failed)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA))),
        @ApiResponse(
                responseCode = "429",
                description = "Too many requests (rate_limited)",
                headers =
                        @Header(
                                name = "Retry-After",
                                description = "Seconds until another reset request may be attempted",
                                schema = @Schema(type = "integer", format = "int64")),
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA)))
    })
    void forgot(@Valid @RequestBody ForgotRequest body, HttpServletRequest request) {
        var email = body.email().strip().toLowerCase(Locale.ROOT);
        if (!EMAIL.matcher(email).matches()) throw new InvalidPasswordResetEmailException();
        limits.forgot(AuthSessionController.clientIp(request, trustedProxies), email);
        forgotUseCase.forgot(email);
    }

    @PostMapping("/auth/password:reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "resetPassword", summary = "Redeem a one-time password reset token")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Password reset; all sessions ended"),
        @ApiResponse(
                responseCode = "400",
                description = "Token invalid, expired or used (reset_token_invalid)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA))),
        @ApiResponse(
                responseCode = "422",
                description = "New password too weak (password_too_weak)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA)))
    })
    void reset(@Valid @RequestBody ResetRequest body, HttpServletResponse response) {
        resetByTokenUseCase.resetByToken(body.token(), body.newPassword());
        RefreshCookie.clear(response);
    }

    private UUID principal(Authentication authentication) {
        if (!(authentication instanceof JwtAuthenticationToken token)) throw new UnresolvedPrincipalException();
        try {
            return UUID.fromString(Objects.requireNonNull(token.getToken().getSubject()));
        } catch (NullPointerException | IllegalArgumentException invalid) {
            throw new UnresolvedPrincipalException();
        }
    }

    record ChangeRequest(
            @NotBlank String oldPassword, @NotBlank String newPassword) {}

    record ForgotRequest(@NotBlank @Schema(format = "email") String email) {}

    record ResetRequest(@NotBlank String token, @NotBlank String newPassword) {}
}
