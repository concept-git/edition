package io.edition.control.compositions.iam.accountsession;

import static io.edition.control.compositions.iam.accountsession.AccountSessionTypes.*;

import io.edition.concepts.user.api.UserApi;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class AccountSessionTypes {
    private AccountSessionTypes() {}

    public record Profile(
            UUID id,
            String email,
            String name,
            String avatar,
            String locale,
            boolean verified,
            String status,
            boolean platformOperator,
            List<TenantMembership> tenants) {
        static Profile from(UserApi.AccountProfile value, boolean platformOperator, List<TenantMembership> tenants) {
            return new Profile(
                    value.id().value(),
                    value.email(),
                    value.name(),
                    value.avatar(),
                    value.locale(),
                    value.verified(),
                    value.status().name().toLowerCase(Locale.ROOT),
                    platformOperator,
                    List.copyOf(tenants));
        }
    }

    public record TenantMembership(UUID id, String name, String role, String status) {}

    public record Device(String name, String browser, String os) {}

    public record SessionView(
            UUID id,
            Device device,
            String ipApproximate,
            java.time.Instant createdAt,
            java.time.Instant lastSeenAt,
            java.time.Instant expiresAt,
            boolean current) {}

    public record Sessions(java.util.List<SessionView> sessions, String nextCursor) {}
}
