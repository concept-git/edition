package io.edition.control.compositions.platform.maildelivery;

import io.edition.concepts.mailoutbox.api.MailDeliveryApi;
import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.password.api.PasswordApi;
import io.edition.concepts.tenantregistry.api.TenantScopeApi;
import io.edition.concepts.user.api.UserApi;
import java.time.Clock;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
final class MailEligibility {
    private final UserApi users;
    private final PasswordApi passwords;
    private final MembershipApi memberships;
    private final TenantScopeApi scope;
    private final Clock clock;

    MailEligibility(
            UserApi users, PasswordApi passwords, MembershipApi memberships, TenantScopeApi scope, Clock clock) {
        this.users = users;
        this.passwords = passwords;
        this.memberships = memberships;
        this.scope = scope;
        this.clock = clock;
    }

    boolean valid(MailDeliveryApi.Lease message, Map<String, String> payload) {
        String token = payload.get("token");
        if (token == null || token.isBlank()) throw new IllegalStateException("mail credential missing");
        if (message.kind().equals("invitation")) {
            return scope.withoutTenant(
                            TenantScopeApi.BootstrapReason.INVITE_RESOLUTION,
                            () -> memberships.inviteOf(MembershipApi.InviteRef.ofToken(token)))
                    .filter(invite -> invite.email().equalsIgnoreCase(message.recipient())
                            && invite.expiresAt().isAfter(clock.instant()))
                    .isPresent();
        }
        var user = new UserApi.UserId(UUID.fromString(payload.get("userId")));
        var account = users.accountProfile(user).orElse(null);
        if (account == null
                || account.status() != UserApi.Status.ACTIVE
                || !message.recipient().equalsIgnoreCase(account.email())) return false;
        return switch (message.kind()) {
            case "verification" -> users.verificationPending(user, token);
            case "password_reset" -> passwords.resetPending(new PasswordApi.AccountId(user.value()), token);
            default -> false;
        };
    }
}
