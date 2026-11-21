package io.edition.control.entry.http.auth;

import io.edition.control.compositions.iam.login.InvalidRefreshException;
import io.edition.control.compositions.iam.login.LoginTypes;
import io.edition.control.compositions.iam.login.LoginUseCase;
import io.edition.control.compositions.iam.login.LogoutUseCase;
import io.edition.control.compositions.iam.login.RefreshUseCase;
import io.edition.control.compositions.principal.RefreshSessionResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
class AuthSessionController {
    private static final String PROBLEM = "application/problem+json";
    private static final String PROBLEM_SCHEMA = "#/components/schemas/ApiProblem";
    private final LoginUseCase loginUseCase;
    private final RefreshUseCase refreshUseCase;
    private final LogoutUseCase logoutUseCase;
    private final AuthenticationRateLimiter limits;
    private final RefreshSessionResolver refreshSessions;
    private final Set<String> allowedOrigins;
    private final Set<String> trustedProxies;

    AuthSessionController(
            LoginUseCase loginUseCase,
            RefreshUseCase refreshUseCase,
            LogoutUseCase logoutUseCase,
            AuthenticationRateLimiter limits,
            RefreshSessionResolver refreshSessions,
            @Value("${security.cors.allowed-origins}") List<String> allowedOrigins,
            @Value("${security.trusted-proxies:127.0.0.1,::1}") List<String> trustedProxies) {
        this.loginUseCase = loginUseCase;
        this.refreshUseCase = refreshUseCase;
        this.logoutUseCase = logoutUseCase;
        this.limits = limits;
        this.refreshSessions = refreshSessions;
        this.allowedOrigins = Set.copyOf(allowedOrigins);
        this.trustedProxies = Set.copyOf(trustedProxies);
    }

    @PostMapping("/login")
    @Operation(
            operationId = "login",
            summary = "Exchange credentials for an access token",
            description = "Returns the access token in the body and the refresh token as a "
                    + "Secure/HttpOnly/SameSite=Lax cookie scoped to /auth. The refresh token never appears in JSON.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Access token issued; refresh cookie set"),
        @ApiResponse(
                responseCode = "401",
                description = "Uniform rejection (invalid_credentials) for unknown email, wrong password, "
                        + "locked, unverified, deactivated or erased accounts",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA))),
        @ApiResponse(
                responseCode = "403",
                description = "Origin not allowed (cross_site_request_rejected)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA))),
        @ApiResponse(
                responseCode = "429",
                description = "Too many attempts (rate_limited)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA)))
    })
    TokenResponse login(
            @Valid @RequestBody LoginRequest body, HttpServletRequest request, HttpServletResponse response) {
        // 登录本身也要防 CSRF：跨站表单能把受害者静默登进攻击者账号，之后的操作都算在受害者头上。
        requireAllowedOrigin(request);
        var email = body.email().strip().toLowerCase(Locale.ROOT);
        var ip = clientIp(request, trustedProxies);
        limits.login(ip, email);
        var credentials = loginUseCase.login(
                email, body.password(), parseDevice(request.getHeader("User-Agent")), approximate(ip));
        RefreshCookie.set(response, credentials.refreshToken());
        return TokenResponse.from(credentials);
    }

    @PostMapping("/refresh")
    @Operation(operationId = "refreshSession", summary = "Rotate the refresh cookie and issue a new access token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "New access token issued; refresh cookie rotated"),
        @ApiResponse(
                responseCode = "401",
                description = "Missing, expired or replayed refresh (invalid_refresh); cookie cleared",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA))),
        @ApiResponse(
                responseCode = "403",
                description = "Origin not allowed (cross_site_request_rejected)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA))),
        @ApiResponse(
                responseCode = "429",
                description = "Too many attempts (rate_limited)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA)))
    })
    TokenResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        requireAllowedOrigin(request);
        var refresh = RefreshCookie.read(request).orElseThrow(InvalidRefreshException::new);
        // 未知 refresh 无 session 可计数，退回按来源地址限流——绝不把密文本身派生成桶键。
        limits.refresh(refreshSessions
                .resolve(refresh)
                .map(UUID::toString)
                .orElseGet(() -> "unresolved:" + clientIp(request, trustedProxies)));
        try {
            var credentials = refreshUseCase.refresh(refresh);
            RefreshCookie.set(response, credentials.refreshToken());
            return TokenResponse.from(credentials);
        } catch (InvalidRefreshException invalid) {
            RefreshCookie.clear(response);
            throw invalid;
        }
    }

    @PostMapping("/logout")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "logout",
            summary = "Revoke the current device session",
            description = "Idempotent: always clears the refresh cookie, with or without a valid session.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Session revoked and cookie cleared"),
        @ApiResponse(
                responseCode = "403",
                description = "Origin not allowed (cross_site_request_rejected)",
                content = @Content(mediaType = PROBLEM, schema = @Schema(ref = PROBLEM_SCHEMA)))
    })
    void logout(HttpServletRequest request, HttpServletResponse response) {
        requireAllowedOrigin(request);
        RefreshCookie.read(request).ifPresent(logoutUseCase::logout);
        RefreshCookie.clear(response);
    }

    private void requireAllowedOrigin(HttpServletRequest request) {
        String source = request.getHeader("Origin");
        if (source == null) source = request.getHeader("Referer");
        if (source == null) throw new CrossSiteRequestException();
        try {
            var uri = URI.create(source);
            if (!allowedOrigins.contains(uri.getScheme() + "://" + uri.getAuthority())) {
                throw new CrossSiteRequestException();
            }
        } catch (IllegalArgumentException malformed) {
            throw new CrossSiteRequestException();
        }
    }

    static String clientIp(HttpServletRequest request, Set<String> trustedProxies) {
        return io.edition.control.entry.http.security.ClientAddress.of(request, trustedProxies);
    }

    static String approximate(String ip) {
        try {
            var address = InetAddress.getByName(ip);
            // 回环没有网段可言，套 /24 或 /48 会回显出一个不存在的网络，读者只会更困惑。
            if (address.isLoopbackAddress()) return "loopback";
            var bytes = address.getAddress();
            if (bytes.length == 4) return "%d.%d.%d.0/24".formatted(bytes[0] & 255, bytes[1] & 255, bytes[2] & 255);
            return "%02x%02x:%02x%02x:%02x%02x::/48"
                    .formatted(
                            bytes[0] & 255,
                            bytes[1] & 255,
                            bytes[2] & 255,
                            bytes[3] & 255,
                            bytes[4] & 255,
                            bytes[5] & 255);
        } catch (UnknownHostException invalid) {
            return "unknown";
        }
    }

    static LoginTypes.Device parseDevice(String ua) {
        String value = ua == null ? "" : ua;
        String browser = value.contains("Edg/")
                ? "Edge"
                : value.contains("Chrome/")
                        ? "Chrome"
                        : value.contains("Firefox/") ? "Firefox" : value.contains("Safari/") ? "Safari" : "Unknown";
        String os = value.contains("Windows")
                ? "Windows"
                : value.contains("Mac OS")
                        ? "macOS"
                        : value.contains("Android") ? "Android" : value.contains("Linux") ? "Linux" : "Unknown";
        String name = "%s on %s".formatted(browser, os);
        return new LoginTypes.Device(name, browser, os);
    }

    record LoginRequest(
            @NotBlank @Email String email, @NotBlank String password) {}

    record TokenResponse(String accessToken, String tokenType, long expiresIn) {
        static TokenResponse from(LoginTypes.Credentials value) {
            return new TokenResponse(value.accessToken(), value.tokenType(), value.expiresIn());
        }
    }
}
