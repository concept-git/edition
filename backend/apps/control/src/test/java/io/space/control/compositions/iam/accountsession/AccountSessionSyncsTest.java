package io.space.control.compositions.iam.accountsession;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class AccountSessionSyncsTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    ProfileUseCase profileUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    UpdateProfileUseCase updateProfileUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListSessionsUseCase listSessionsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    EndSessionUseCase endSessionUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    TouchUseCase touchUseCase;

    @Autowired
    AccountTenants accountTenants;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void profileIncludesOperatorFlagAndSortedTenantMembershipsWithStatus() {
        UserApi.UserId user = verifiedUser("profile@account-session-syncs.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", user.value());
        String credential = start(user, "Current").accessToken();
        var zulu = provisionTenantUseCase
                .provisionTenant(credential, "Zulu Tenant", "profile@account-session-syncs.test")
                .tenant()
                .id();
        provisionTenantUseCase.provisionTenant(credential, "Alpha Tenant", "profile@account-session-syncs.test");
        suspendTenantUseCase.suspendTenant(credential, zulu);

        var profile = profileUseCase.profile(user.value());

        assertThat(profile.platformOperator()).isTrue();
        assertThat(profile.tenants())
                .extracting(AccountSessionTypes.TenantMembership::name)
                .containsExactly("Alpha Tenant", "Zulu Tenant");
        assertThat(profile.tenants())
                .filteredOn(tenant -> tenant.id().equals(zulu))
                .singleElement()
                .extracting(AccountSessionTypes.TenantMembership::status)
                .isEqualTo("suspended");
        assertThat(accountTenants.tenantsOf(user.value())).isEqualTo(profile.tenants());
    }

    @Test
    void updateProfileMapsSuccessAndRejectionWithoutLosingAccountContext() {
        UserApi.UserId user = verifiedUser("update@account-session-syncs.test");

        var updated = updateProfileUseCase.updateProfile(
                user.value(), "Updated Name", "en-US", "https://example.test/avatar.png");

        assertThat(updated.name()).isEqualTo("Updated Name");
        assertThat(updated.locale()).isEqualTo("en-US");
        assertThat(updated.avatar()).isEqualTo("https://example.test/avatar.png");
        assertThatExceptionOfType(ProfileRejectedException.class)
                .isThrownBy(() -> updateProfileUseCase.updateProfile(user.value(), " ", "en-US", null));
    }

    @Test
    void listAndEndSessionMapViewsAndRejectMalformedCursors() {
        UserApi.UserId user = verifiedUser("sessions@account-session-syncs.test");
        var first = start(user, "First");
        var current = start(user, "Current");

        var listed = listSessionsUseCase.listSessions(
                user.value(), null, 20, current.session().value());

        assertThat(listed.sessions())
                .extracting(AccountSessionTypes.SessionView::id)
                .contains(first.session().value(), current.session().value());
        assertThat(listed.sessions())
                .filteredOn(AccountSessionTypes.SessionView::current)
                .singleElement()
                .extracting(AccountSessionTypes.SessionView::id)
                .isEqualTo(current.session().value());
        assertThatExceptionOfType(InvalidCursorException.class)
                .isThrownBy(() -> listSessionsUseCase.listSessions(
                        user.value(), "broken", 20, current.session().value()));

        endSessionUseCase.endSession(user.value(), first.session().value());
        assertThat(sessions.principal(first.session())).isEmpty();
        assertThat(sessions.principal(current.session())).isPresent();
    }

    @Test
    void touchDelegatesAuthenticatedActivityToTheSessionConcept() throws Exception {
        UserApi.UserId user = verifiedUser("touch@account-session-syncs.test");
        var session = start(user, "Touch").session();
        jdbc.update(
                "update iam.sessions set last_seen_at = now() - interval '6 minutes' where id = ?", session.value());
        Instant before = lastSeenAt(session);

        touchUseCase.touch(session.value());

        Instant deadline = Instant.now().plusSeconds(3);
        while (!lastSeenAt(session).isAfter(before) && Instant.now().isBefore(deadline)) {
            Thread.sleep(25);
        }
        assertThat(lastSeenAt(session)).isAfter(before);
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Account Session User");
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        return registered.user();
    }

    private SessionApi.Credentials start(UserApi.UserId user, String device) {
        return ((SessionApi.StartResult.Started) sessions.start(
                        new SessionApi.HolderId(user.value()),
                        new SessionApi.Device(device, "Test Browser", "Test OS"),
                        "unknown"))
                .credentials();
    }

    private Instant lastSeenAt(SessionApi.SessionId session) {
        return jdbc.queryForObject(
                "select last_seen_at from iam.sessions where id = ?", Instant.class, session.value());
    }
}
