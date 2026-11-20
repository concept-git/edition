package io.space.control.entry.http.membership;

import io.space.control.compositions.iam.membership.AcceptInviteUseCase;
import io.space.control.compositions.iam.membership.MembershipTypes;
import io.space.control.compositions.iam.membership.PreviewInviteUseCase;
import io.space.control.compositions.principal.UnresolvedPrincipalException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.Objects;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 受邀人视角的邀请端点：摘要公开可读（未注册也要看得懂），接受则需登录且邮箱匹配。 */
@RestController
@RequestMapping("/api/v1/invitations")
class InvitationController {

    static final String PROBLEM = "application/problem+json";

    private final io.space.control.entry.http.auth.AuthenticationRateLimiter limits;
    private final java.util.Set<String> trustedProxies;
    private final PreviewInviteUseCase previewInviteUseCase;
    private final AcceptInviteUseCase acceptInviteUseCase;

    InvitationController(
            PreviewInviteUseCase previewInviteUseCase,
            AcceptInviteUseCase acceptInviteUseCase,
            io.space.control.entry.http.auth.AuthenticationRateLimiter limits,
            @org.springframework.beans.factory.annotation.Value("${security.trusted-proxies:127.0.0.1,::1}")
                    java.util.Set<String> trustedProxies) {
        this.limits = limits;
        this.trustedProxies = trustedProxies;
        this.previewInviteUseCase = previewInviteUseCase;
        this.acceptInviteUseCase = acceptInviteUseCase;
    }

    @GetMapping("/{token}")
    @Operation(
            operationId = "previewInvitation",
            summary = "Read an invitation summary",
            description = "Public on purpose: whoever holds the link was sent it, and an unregistered invitee "
                    + "must see which tenant and address the invite is for before signing up.")
    @ApiResponse(responseCode = "200", description = "Invitation summary")
    @ApiResponse(
            responseCode = "400",
            description = "Invalid, expired or already used (invite_invalid)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    @ApiResponse(
            responseCode = "429",
            description = "IP or invitation fingerprint rate limit (rate_limited)",
            headers =
                    @io.swagger.v3.oas.annotations.headers.Header(
                            name = "Retry-After",
                            schema = @Schema(type = "integer", minimum = "1")),
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    MembershipTypes.InvitePreview preview(@PathVariable String token, jakarta.servlet.http.HttpServletRequest request) {
        limits.preview(io.space.control.entry.http.security.ClientAddress.of(request, trustedProxies), token);
        return previewInviteUseCase.previewInvite(token);
    }

    @PostMapping("/{token}:accept")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            operationId = "acceptInvitation",
            summary = "Accept an invitation",
            description = "The signed-in account's email must match the invited address, so a forwarded link "
                    + "is useless to anyone else.")
    @ApiResponse(responseCode = "200", description = "Joined the tenant")
    @ApiResponse(
            responseCode = "400",
            description = "Invalid, expired or already used (invite_invalid)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    @ApiResponse(
            responseCode = "409",
            description = "Invited address differs (invite_email_mismatch)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    MembershipTypes.Accepted accept(Authentication authentication, @PathVariable String token) {
        return acceptInviteUseCase.acceptInvite(principal(authentication), token);
    }

    private UUID principal(Authentication authentication) {
        if (!(authentication instanceof JwtAuthenticationToken token)) {
            throw new UnresolvedPrincipalException();
        }
        try {
            return UUID.fromString(Objects.requireNonNull(token.getToken().getSubject()));
        } catch (NullPointerException | IllegalArgumentException unusable) {
            throw new UnresolvedPrincipalException();
        }
    }
}
