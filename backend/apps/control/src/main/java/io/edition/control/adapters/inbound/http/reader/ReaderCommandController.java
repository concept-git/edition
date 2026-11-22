package io.edition.control.adapters.inbound.http.reader;

import com.github.benmanes.caffeine.cache.Caffeine;
import io.edition.content.ResourcePath;
import io.edition.control.adapters.inbound.http.problem.ProblemResponseWriter;
import io.edition.control.adapters.inbound.http.problem.RequestIds;
import io.edition.control.adapters.inbound.http.security.ClientAddress;
import io.edition.control.usecases.hosting.readersecurity.ReaderCommands;
import io.edition.delivery.contract.ReaderOrigin;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/_auth")
public class ReaderCommandController {
    private static final String ACCESS = "__Host-space_reader";
    private static final String REFRESH = "__Secure-space_reader_refresh";
    private final ReaderCommands commands;
    private final Set<String> proxies;
    private final com.github.benmanes.caffeine.cache.Cache<String, AtomicInteger> attempts = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(1))
            .maximumSize(20000)
            .build();

    ReaderCommandController(
            ReaderCommands commands, @Value("${security.trusted-proxies:127.0.0.1,::1}") Set<String> proxies) {
        this.commands = commands;
        this.proxies = Set.copyOf(proxies);
    }

    @PostMapping(value = "/session", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(operationId = "openReaderSession", summary = "Sign a reader in on the current site")
    @ApiResponse(responseCode = "201", description = "Session cookies are set; the body carries no secrets")
    @ApiResponse(responseCode = "401", description = "Credentials were not accepted")
    @ApiResponse(responseCode = "403", description = "Cross-site request")
    @ApiResponse(responseCode = "422", description = "Missing or oversized fields")
    @ApiResponse(responseCode = "429", description = "Too many attempts; respect Retry-After")
    ResponseEntity<ReaderSessionOpened> open(
            @RequestBody ReaderSessionLogin body, HttpServletRequest request, HttpServletResponse response) {
        var site = sessionSite(request);
        if (body == null
                || body.email() == null
                || body.email().isBlank()
                || body.email().length() > 320
                || body.password() == null
                || body.password().isEmpty()
                || body.password().length() > 1024) throw new Failure(422, "validation_failed");
        if (exceeds("ip:" + ClientAddress.of(request, proxies), 100)
                || exceeds("email:" + body.email().strip().toLowerCase(Locale.ROOT), 10))
            throw new Failure(429, "rate_limited", 60);
        var credentials = commands.login(site.host(), body.email(), body.password())
                .orElseThrow(() -> new Failure(401, "invalid_credentials"));
        setCookies(response, credentials);
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(new ReaderSessionOpened(credentials.expiresAt()));
    }

    @GetMapping(value = "/session", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(operationId = "readReaderSession", summary = "Tell whether the presented reader session is valid")
    @ApiResponse(responseCode = "200", description = "The session is valid")
    @ApiResponse(responseCode = "401", description = "No valid session")
    ResponseEntity<ReaderSessionState> current(HttpServletRequest request) {
        var host = site(request, false).host();
        if (!commands.authenticated(host, access(request))) throw new Failure(401, "reader_session_invalid");
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new ReaderSessionState(true));
    }

    @DeleteMapping("/session")
    @Operation(operationId = "closeReaderSession", summary = "End the reader session; repeating it is harmless")
    @ApiResponse(responseCode = "204", description = "Session cookies are cleared")
    @ApiResponse(responseCode = "403", description = "Cross-site request")
    ResponseEntity<Void> close(HttpServletRequest request, HttpServletResponse response) {
        commands.logout(sessionSite(request).host(), cookie(request, REFRESH));
        clear(response);
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }

    @PostMapping("/session/refresh")
    @Operation(
            operationId = "refreshReaderSession",
            summary = "Rotate the reader session credentials",
            description = "Also accepts a script-free form (application/x-www-form-urlencoded, field returnTo): "
                    + "success is 303 to the same-site returnTo, an invalid session is 303 to /_login, "
                    + "and a dependency outage is an HTML 503/504 page carrying X-Request-Id.")
    @ApiResponse(responseCode = "204", description = "Fresh session cookies are set")
    @ApiResponse(responseCode = "303", description = "Form submission: cookies set, redirect to returnTo")
    @ApiResponse(responseCode = "503", description = "Dependency unavailable; credentials are kept")
    @ApiResponse(responseCode = "401", description = "The refresh credential is no longer valid; cookies are cleared")
    @ApiResponse(responseCode = "403", description = "Cross-site request")
    ResponseEntity<Void> renew(HttpServletRequest request, HttpServletResponse response) {
        var site = sessionSite(request);
        var rotated = commands.refresh(site.host(), cookie(request, REFRESH));
        if (rotated.isEmpty()) {
            clear(response);
            throw new Failure(401, "reader_session_invalid");
        }
        setCookies(response, rotated.get());
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }

    /**
     * 无脚本「继续阅读」表单（ADR-0035）：刷新 Cookie 只对 {@code /_auth} 发送，表单因此直接提交到这里。
     * 成功 303 回已校验的站内 {@code returnTo}；会话失效清 Cookie 并 303 到登录页；依赖故障渲染带请求号的 HTML，
     * 保留凭据并给出回到原页重试的链接。
     */
    @PostMapping(value = "/session/refresh", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @Operation(hidden = true)
    ResponseEntity<?> renewForm(
            @RequestParam(required = false) String returnTo, HttpServletRequest request, HttpServletResponse response) {
        var target = ReturnTarget.of(returnTo);
        try {
            var site = sessionSite(request);
            var rotated = commands.refresh(site.host(), cookie(request, REFRESH));
            if (rotated.isEmpty()) {
                clear(response);
                return redirect("/_login?returnTo=" + URLEncoder.encode(target, StandardCharsets.UTF_8));
            }
            setCookies(response, rotated.get());
            return redirect(target);
        } catch (org.springframework.dao.DataAccessException
                | org.springframework.transaction.TransactionException failure) {
            var dependency = ProblemResponseWriter.dependencyProblem(failure);
            if (dependency == null) throw failure;
            return ReaderContinueFailure.page(dependency.status(), target, RequestIds.requestId(request));
        }
    }

    record ReaderSessionLogin(String email, String password) {}

    record ReaderSessionOpened(Instant expiresAt) {}

    record ReaderSessionState(boolean authenticated) {}

    @GetMapping(value = "/history", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(operationId = "readerHistory", summary = "List this reader's recent spaces and last opened pages")
    ResponseEntity<List<ReaderCommands.History>> history(HttpServletRequest request) {
        var host = site(request, false).host();
        var history =
                commands.history(host, access(request)).orElseThrow(() -> new Failure(401, "reader_session_invalid"));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(history);
    }

    @PostMapping(value = "/history", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(operationId = "recordReaderHistory", summary = "Remember the last opened page for this reader")
    @ApiResponse(responseCode = "204", description = "History updated")
    ResponseEntity<Void> visit(@RequestBody Visit visit, HttpServletRequest request) {
        var host = site(request, true).host();
        if (visit.spaceSlug() == null
                || !visit.spaceSlug().matches("[a-z0-9][a-z0-9-]{0,99}")
                || visit.pagePath() == null
                || visit.pagePath().length() > 512
                || !visit.pagePath().startsWith("/" + visit.spaceSlug() + "/"))
            throw new Failure(422, "validation_failed");
        try {
            new ResourcePath(visit.pagePath().substring(visit.spaceSlug().length() + 2));
        } catch (IllegalArgumentException invalid) {
            throw new Failure(422, "validation_failed");
        }
        if (!commands.visit(host, access(request), visit.pagePath())) throw new Failure(401, "reader_session_invalid");
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }

    record Visit(String spaceSlug, String pagePath) {}

    private ReaderCommands.Destination site(HttpServletRequest request, boolean mutation) {
        var origin = origin(request);
        if (mutation
                && (!"https".equals(origin.scheme())
                        || !origin.absolute(origin.host(), "").equals(request.getHeader("Origin"))))
            throw new Failure(403, "cross_site_request_rejected");
        return commands.destination(origin.host()).orElseThrow(() -> new Failure(404, "site_not_found"));
    }

    /** 会话写操作：缺少 {@code Origin} 时以 {@code Sec-Fetch-Site: same-origin} 兜底，其余一律拒绝。 */
    private ReaderCommands.Destination sessionSite(HttpServletRequest request) {
        var origin = origin(request);
        String declared = request.getHeader("Origin");
        boolean sameSite = declared != null
                ? origin.absolute(origin.host(), "").equals(declared)
                : "same-origin".equals(request.getHeader("Sec-Fetch-Site"));
        if (!"https".equals(origin.scheme()) || !sameSite) throw new Failure(403, "cross_site_request_rejected");
        return commands.destination(origin.host()).orElseThrow(() -> new Failure(404, "site_not_found"));
    }

    private ReaderOrigin origin(HttpServletRequest request) {
        boolean trusted = proxies.contains(request.getRemoteAddr());
        String scheme = header(request, trusted, "X-Forwarded-Proto", request.getScheme())
                .toLowerCase(Locale.ROOT);
        String authority = header(request, trusted, "X-Forwarded-Host", request.getHeader("Host"));
        try {
            return ReaderOrigin.resolve(scheme, authority == null ? request.getServerName() : authority);
        } catch (IllegalArgumentException malformed) {
            throw new Failure(403, "read_forbidden");
        }
    }

    private static String header(HttpServletRequest request, boolean trusted, String name, String fallback) {
        String value = trusted ? request.getHeader(name) : null;
        return value == null ? fallback : ReaderOrigin.first(value);
    }

    private boolean exceeds(String key, int maximum) {
        return attempts.get(key, ignored -> new AtomicInteger()).incrementAndGet() > maximum;
    }

    private static ResponseEntity<Void> redirect(String target) {
        return ResponseEntity.status(303)
                .cacheControl(CacheControl.noStore())
                .location(URI.create(target))
                .build();
    }

    private static String access(HttpServletRequest request) {
        if (request.getHeader("Authorization") != null) throw new Failure(401, "reader_session_invalid");
        return cookie(request, ACCESS);
    }

    private static String cookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        var cookies = Arrays.stream(request.getCookies())
                .filter(cookie -> cookie.getName().equals(name))
                .toList();
        return cookies.size() == 1 ? cookies.getFirst().getValue() : null;
    }

    private static void setCookies(HttpServletResponse response, ReaderCommands.Credentials credentials) {
        long ttl = Math.max(
                0, Duration.between(Instant.now(), credentials.expiresAt()).toSeconds());
        cookie(response, ACCESS, credentials.access(), "/", ttl);
        cookie(response, REFRESH, credentials.refresh(), "/_auth", ttl);
    }

    private static void clear(HttpServletResponse response) {
        cookie(response, ACCESS, "", "/", 0);
        cookie(response, REFRESH, "", "/_auth", 0);
    }

    private static void cookie(HttpServletResponse response, String name, String value, String path, long ttl) {
        response.addHeader(
                HttpHeaders.SET_COOKIE,
                ResponseCookie.from(name, value)
                        .secure(true)
                        .httpOnly(true)
                        .sameSite("Lax")
                        .path(path)
                        .maxAge(ttl)
                        .build()
                        .toString());
    }

    @ExceptionHandler(Failure.class)
    ResponseEntity<Map<String, Object>> rejected(Failure error) {
        var response = ResponseEntity.status(error.status)
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.APPLICATION_PROBLEM_JSON);
        if (error.retryAfter > 0) response.header(HttpHeaders.RETRY_AFTER, Long.toString(error.retryAfter));
        return response.body(Map.of(
                "type",
                "about:blank",
                "status",
                error.status,
                "code",
                error.getMessage(),
                "title",
                HttpStatus.valueOf(error.status).getReasonPhrase()));
    }

    private static final class Failure extends RuntimeException {
        private final int status;
        private final long retryAfter;

        private Failure(int status, String code) {
            this(status, code, 0);
        }

        private Failure(int status, String code, long retryAfter) {
            super(code);
            this.status = status;
            this.retryAfter = retryAfter;
        }
    }
}
