package io.edition.control.entry.http.auth;

import io.edition.control.compositions.iam.registration.RegisterUseCase;
import io.edition.control.compositions.iam.registration.ResendVerificationUseCase;
import io.edition.control.compositions.iam.registration.VerifyEmailUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 认证面（匿名）：注册与激活 flow 的 HTTP 入口，只做 DTO ↔ flow 翻译。 */
@RestController
@RequestMapping("/auth")
class AuthRegistrationController {

    private static final String PROBLEM = "application/problem+json";

    private final RegisterUseCase registerUseCase;
    private final VerifyEmailUseCase verifyEmailUseCase;
    private final ResendVerificationUseCase resendVerificationUseCase;
    private final AuthenticationRateLimiter limits;
    private final java.util.Set<String> trustedProxies;

    AuthRegistrationController(
            RegisterUseCase registerUseCase,
            VerifyEmailUseCase verifyEmailUseCase,
            ResendVerificationUseCase resendVerificationUseCase,
            AuthenticationRateLimiter limits,
            @org.springframework.beans.factory.annotation.Value("${security.trusted-proxies:127.0.0.1,::1}")
                    java.util.List<String> trustedProxies) {
        this.registerUseCase = registerUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.resendVerificationUseCase = resendVerificationUseCase;
        this.limits = limits;
        this.trustedProxies = java.util.Set.copyOf(trustedProxies);
    }

    @PostMapping("/email:resend")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(
            operationId = "resendVerification",
            summary = "Request a new verification email",
            description = "Uniform accepted response; does not disclose identity eligibility or delivery outcome.")
    @ApiResponses({
        @ApiResponse(responseCode = "202", description = "Request accepted"),
        @ApiResponse(
                responseCode = "429",
                description = "Rate limited (rate_limited)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    })
    void resend(@Valid @RequestBody ResendRequest body, jakarta.servlet.http.HttpServletRequest request) {
        String email = body.email().strip().toLowerCase(Locale.ROOT);
        limits.verification(AuthSessionController.clientIp(request, trustedProxies), email);
        resendVerificationUseCase.resendVerification(email);
    }

    record ResendRequest(@NotBlank @Email String email) {}

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            operationId = "register",
            summary = "Register a new account",
            description = "Creates the user, sets the password and issues an email verification token. "
                    + "The verification email intent is persisted for asynchronous delivery.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Account created; verification mail issued"),
        @ApiResponse(
                responseCode = "409",
                description = "Email already registered (email_taken)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem"))),
        @ApiResponse(
                responseCode = "422",
                description = "Password too weak (password_too_weak); registration is rolled back",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    })
    RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return new RegisterResponse(registerUseCase.register(request.email(), request.name(), request.password()));
    }

    @PostMapping("/email:verify")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "verifyEmail", summary = "Redeem an email verification token")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Email verified"),
        @ApiResponse(
                responseCode = "400",
                description = "Token invalid, expired or already used (verify_token_invalid)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    })
    void verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        verifyEmailUseCase.verifyEmail(request.user(), request.token());
    }

    record RegisterRequest(
            @NotBlank @Email @Schema(example = "alice@example.com")
            String email,

            @NotBlank @Schema(example = "Alice") String name,
            @NotBlank String password) {}

    record RegisterResponse(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            UUID userId) {}

    record VerifyEmailRequest(@NotNull UUID user, @NotBlank String token) {}
}
