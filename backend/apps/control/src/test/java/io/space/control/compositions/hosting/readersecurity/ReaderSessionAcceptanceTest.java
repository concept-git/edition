package io.space.control.compositions.hosting.readersecurity;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.site.api.SiteApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ReaderSessionAcceptanceTest {
    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> source = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    UserApi users;

    @Autowired
    PasswordApi passwords;

    @Autowired
    PermissionApi permissions;

    @Autowired
    SiteApi sites;

    @Autowired
    CustomDomainApi domains;

    @Autowired
    TenantRegistryApi tenants;

    @Autowired
    TenantScopeApi scope;

    @Autowired
    PlatformTransactionManager transactions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate owner;

    @Autowired
    ReaderCommands commands;

    @Autowired
    org.springframework.test.web.servlet.MockMvc mvc;

    @Test
    void sameOriginSessionRecordsHistoryOnThePrimaryHost() throws Exception {
        var fixture = fixture();
        String host = fixture.host();
        String origin = "https://" + host;
        String email = users.accountProfile(new UserApi.UserId(fixture.user()))
                .orElseThrow()
                .email();
        var accepted = mvc.perform(session(org.springframework.http.HttpMethod.POST, host, "/_auth/session", origin)
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"password1\"}"))
                .andReturn()
                .getResponse();
        assertThat(accepted.getStatus()).isEqualTo(201);
        assertThat(accepted.getHeaders("Set-Cookie"))
                .hasSize(2)
                .allSatisfy(cookie -> assertThat(cookie).contains("Secure", "HttpOnly", "SameSite=Lax"));
        String proof = cookieValue(accepted, 0);
        assertThat(owner.queryForObject("""
                select outcome from publication_v1.read_session(encode(sha256(convert_to(?,'UTF8')),'hex'),?,?)
                """, String.class, proof, host, fixture.site()))
                .isEqualTo("ok");
        var cookie = new jakarta.servlet.http.Cookie("__Host-space_reader", proof);
        var history = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                        origin + "/_auth/history")
                .secure(true)
                .header("Host", host)
                .header("Origin", origin)
                .cookie(cookie)
                .contentType("application/json")
                .content("{\"spaceSlug\":\"docs\",\"pagePath\":\"/docs/one\"}");
        assertThat(mvc.perform(history).andReturn().getResponse().getStatus()).isEqualTo(204);
        var list = mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                                origin + "/_auth/history")
                        .secure(true)
                        .header("Host", host)
                        .cookie(cookie))
                .andReturn()
                .getResponse();
        assertThat(list.getStatus()).isEqualTo(200);
        assertThat(list.getContentAsString()).contains("/docs/one");
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder session(
            org.springframework.http.HttpMethod method, String host, String path, String origin) {
        var request = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request(
                        method, "https://" + host + path)
                .secure(true)
                .header("Host", host);
        if (origin != null) request.header("Origin", origin);
        return request;
    }

    private static String cookieValue(org.springframework.mock.web.MockHttpServletResponse response, int index) {
        return response.getHeaders("Set-Cookie").get(index).split(";", 2)[0].split("=", 2)[1];
    }

    @Test
    void sessionResourceCoversLoginInspectionRefreshAndLogoutWithProblemJson() throws Exception {
        var fixture = fixture();
        String host = fixture.host(), origin = "https://" + host;
        String email = users.accountProfile(new UserApi.UserId(fixture.user()))
                .orElseThrow()
                .email();
        var post = org.springframework.http.HttpMethod.POST;
        String body = "{\"email\":\"" + email + "\",\"password\":\"password1\"}";

        var wrong = mvc.perform(session(post, host, "/_auth/session", origin)
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"wrong\"}"))
                .andReturn()
                .getResponse();
        assertThat(wrong.getStatus()).isEqualTo(401);
        assertThat(wrong.getContentType()).startsWith("application/problem+json");
        assertThat(wrong.getContentAsString()).contains("invalid_credentials");

        for (var rejected : List.of(
                session(post, host, "/_auth/session", "https://elsewhere.test"),
                session(post, host, "/_auth/session", null),
                session(post, host, "/_auth/session", null).header("Sec-Fetch-Site", "cross-site"))) {
            assertThat(mvc.perform(rejected.contentType("application/json").content(body))
                            .andReturn()
                            .getResponse()
                            .getStatus())
                    .isEqualTo(403);
        }
        assertThat(mvc.perform(session(post, host, "/_auth/session", origin)
                                .contentType("application/json")
                                .content("{\"email\":\"\",\"password\":\"x\"}"))
                        .andReturn()
                        .getResponse()
                        .getStatus())
                .isEqualTo(422);

        var opened = mvc.perform(session(post, host, "/_auth/session", null)
                        .header("Sec-Fetch-Site", "same-origin")
                        .contentType("application/json")
                        .content(body))
                .andReturn()
                .getResponse();
        assertThat(opened.getStatus()).isEqualTo(201);
        assertThat(opened.getHeader("Cache-Control")).contains("no-store");
        assertThat(opened.getHeaders("Set-Cookie"))
                .hasSize(2)
                .allSatisfy(cookie -> assertThat(cookie).contains("Secure", "HttpOnly", "SameSite=Lax"));
        String access = cookieValue(opened, 0), refresh = cookieValue(opened, 1);
        assertThat(opened.getContentAsString()).contains("expiresAt").doesNotContain(access, refresh);

        var accessCookie = new jakarta.servlet.http.Cookie("__Host-space_reader", access);
        var refreshCookie = new jakarta.servlet.http.Cookie("__Secure-space_reader_refresh", refresh);
        var get = org.springframework.http.HttpMethod.GET;
        assertThat(mvc.perform(session(get, host, "/_auth/session", null).cookie(accessCookie))
                        .andReturn()
                        .getResponse()
                        .getContentAsString())
                .contains("\"authenticated\":true");
        var anonymous = mvc.perform(session(get, host, "/_auth/session", null))
                .andReturn()
                .getResponse();
        assertThat(anonymous.getStatus()).isEqualTo(401);
        assertThat(anonymous.getContentType()).startsWith("application/problem+json");

        var refreshed = mvc.perform(
                        session(post, host, "/_auth/session/refresh", origin).cookie(refreshCookie))
                .andReturn()
                .getResponse();
        assertThat(refreshed.getStatus()).isEqualTo(204);
        assertThat(refreshed.getHeaders("Set-Cookie")).hasSize(2);
        var stale = mvc.perform(
                        session(post, host, "/_auth/session/refresh", origin).cookie(refreshCookie))
                .andReturn()
                .getResponse();
        assertThat(stale.getStatus()).isEqualTo(401);
        assertThat(stale.getHeaders("Set-Cookie"))
                .allSatisfy(cookie -> assertThat(cookie).contains("Max-Age=0"));

        var rotatedRefresh =
                new jakarta.servlet.http.Cookie("__Secure-space_reader_refresh", cookieValue(refreshed, 1));
        var rotatedAccess = new jakarta.servlet.http.Cookie("__Host-space_reader", cookieValue(refreshed, 0));
        var delete = org.springframework.http.HttpMethod.DELETE;
        assertThat(mvc.perform(session(delete, host, "/_auth/session", "https://elsewhere.test")
                                .cookie(rotatedRefresh))
                        .andReturn()
                        .getResponse()
                        .getStatus())
                .isEqualTo(403);
        var closed = mvc.perform(session(delete, host, "/_auth/session", origin).cookie(rotatedRefresh))
                .andReturn()
                .getResponse();
        assertThat(closed.getStatus()).isEqualTo(204);
        assertThat(closed.getHeaders("Set-Cookie"))
                .allSatisfy(cookie -> assertThat(cookie).contains("Max-Age=0"));
        assertThat(mvc.perform(session(get, host, "/_auth/session", null).cookie(rotatedAccess))
                        .andReturn()
                        .getResponse()
                        .getStatus())
                .isEqualTo(401);
        assertThat(mvc.perform(session(delete, host, "/_auth/session", origin))
                        .andReturn()
                        .getResponse()
                        .getStatus())
                .isEqualTo(204);
    }

    @Test
    void scriptFreeRefreshFormRotatesCookiesAndRedirectsWithinTheSite() throws Exception {
        var fixture = fixture();
        String host = fixture.host(), origin = "https://" + host;
        String email = users.accountProfile(new UserApi.UserId(fixture.user()))
                .orElseThrow()
                .email();
        var post = org.springframework.http.HttpMethod.POST;
        var opened = mvc.perform(session(post, host, "/_auth/session", origin)
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"password1\"}"))
                .andReturn()
                .getResponse();
        var refresh = new jakarta.servlet.http.Cookie("__Secure-space_reader_refresh", cookieValue(opened, 1));

        assertThat(mvc.perform(form(host, "https://x.test", "/docs/two").cookie(refresh))
                        .andReturn()
                        .getResponse()
                        .getStatus())
                .isEqualTo(403);
        var sameOriginFetch = form(host, null, "/docs/two").cookie(refresh).header("Sec-Fetch-Site", "same-site");
        assertThat(mvc.perform(sameOriginFetch).andReturn().getResponse().getStatus())
                .isEqualTo(403);

        var renewed = mvc.perform(form(host, origin, "/docs/two?x=1").cookie(refresh))
                .andReturn()
                .getResponse();
        assertThat(renewed.getStatus()).isEqualTo(303);
        assertThat(renewed.getHeader("Location")).isEqualTo("/docs/two?x=1");
        assertThat(renewed.getHeader("Cache-Control")).contains("no-store");
        assertThat(renewed.getHeaders("Set-Cookie"))
                .hasSize(2)
                .allSatisfy(cookie -> assertThat(cookie).contains("Secure", "HttpOnly", "SameSite=Lax"));
        assertThat(renewed.getHeaders("Set-Cookie").get(1)).contains("Path=/_auth");

        var hostile = new jakarta.servlet.http.Cookie("__Secure-space_reader_refresh", cookieValue(renewed, 1));
        var fallback = mvc.perform(form(host, null, "//evil.test")
                        .header("Sec-Fetch-Site", "same-origin")
                        .cookie(hostile))
                .andReturn()
                .getResponse();
        assertThat(fallback.getStatus()).isEqualTo(303);
        assertThat(fallback.getHeader("Location")).isEqualTo("/");

        var stale = mvc.perform(form(host, origin, "/docs/two").cookie(refresh))
                .andReturn()
                .getResponse();
        assertThat(stale.getStatus()).isEqualTo(303);
        assertThat(stale.getHeader("Location")).isEqualTo("/_login?returnTo=%2Fdocs%2Ftwo");
        assertThat(stale.getHeaders("Set-Cookie"))
                .allSatisfy(cookie -> assertThat(cookie).contains("Max-Age=0"));

        var json = mvc.perform(session(post, host, "/_auth/session/refresh", origin)
                        .cookie(new jakarta.servlet.http.Cookie("__Secure-space_reader_refresh", "unknown")))
                .andReturn()
                .getResponse();
        assertThat(json.getStatus()).isEqualTo(401);
        assertThat(json.getContentType()).startsWith("application/problem+json");
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder form(
            String host, String origin, String returnTo) {
        return session(org.springframework.http.HttpMethod.POST, host, "/_auth/session/refresh", origin)
                .contentType("application/x-www-form-urlencoded")
                .param("returnTo", returnTo);
    }

    @Test
    void sessionLoginAttemptsAreRateLimitedPerAccount() throws Exception {
        var fixture = fixture();
        String host = fixture.host(),
                origin = "https://" + host,
                email = "limited-" + UUID.randomUUID() + "@reader.test";
        int status = 0;
        org.springframework.mock.web.MockHttpServletResponse last = null;
        for (int attempt = 0; attempt < 11; attempt++) {
            last = mvc.perform(session(org.springframework.http.HttpMethod.POST, host, "/_auth/session", origin)
                            .contentType("application/json")
                            .content("{\"email\":\"" + email + "\",\"password\":\"wrong\"}"))
                    .andReturn()
                    .getResponse();
            status = last.getStatus();
        }
        assertThat(status).isEqualTo(429);
        assertThat(last.getHeader("Retry-After")).isEqualTo("60");
    }

    @Test
    void commandsRotateProofsAndKeepHistoryScopedToTheCurrentAccount() {
        var fixture = fixture();
        var user = new UserApi.UserId(fixture.user());
        String email = users.accountProfile(user).orElseThrow().email();
        String host = fixture.host();
        assertThat(commands.login(host, email, "wrong")).isEmpty();
        var opened = commands.login(host, email, "password1").orElseThrow();
        assertThat(commands.visit(host, opened.access(), "docs", "/docs/one")).isTrue();
        assertThat(commands.history(host, opened.access()).orElseThrow()).hasSize(1);
        assertThat(commands.refresh("another.test", opened.refresh())).isEmpty();

        var rotated = commands.refresh(host, opened.refresh()).orElseThrow();
        assertThat(rotated.expiresAt()).isEqualTo(opened.expiresAt());
        assertThat(commands.refresh(host, opened.refresh())).isEmpty();
        assertThat(commands.history(host, opened.access())).isEmpty();
        assertThat(commands.history(host, rotated.access()).orElseThrow()).hasSize(1);
        commands.logout(host, rotated.refresh());
        assertThat(commands.refresh(host, rotated.refresh())).isEmpty();
        assertThat(commands.history(host, rotated.access())).isEmpty();

        var second = commands.login(host, email, "password1").orElseThrow();
        users.deactivate(user);
        users.reactivate(user);
        assertThat(commands.refresh(host, second.refresh())).isEmpty();
        assertThat(commands.visit(host, second.access(), "docs", "/docs/stale")).isFalse();
        var current = commands.login(host, email, "password1").orElseThrow();
        assertThat(commands.history(host, current.access())
                        .orElseThrow()
                        .getFirst()
                        .pagePath())
                .isEqualTo("/docs/one");
    }

    @Test
    void accountDeactivationAndReactivationAdvanceCanonicalReaderVersionWithoutProjection() {
        var fixture = fixture();
        var user = new UserApi.UserId(fixture.user());
        long issued = users.readerEpoch(user);
        users.deactivate(user);
        assertThat(users.readerEpoch(user)).isEqualTo(issued + 1);
        users.reactivate(user);
        assertThat(users.readerEpoch(user)).isEqualTo(issued + 2);
        users.updateProfile(user, "Updated", null, null);
        assertThat(users.readerEpoch(user)).isEqualTo(issued + 2);
    }

    @Test
    void rolledBackAccountChangesLeaveNoRemoteFenceOrRevocationToRepair() {
        var fixture = fixture();
        var user = new UserApi.UserId(fixture.user());
        long issued = users.readerEpoch(user);
        assertThatThrownBy(() -> new TransactionTemplate(transactions).executeWithoutResult(status -> {
                    users.deactivate(user);
                    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                        @Override
                        public void beforeCommit(boolean readOnly) {
                            throw new IllegalStateException("simulate rollback");
                        }
                    });
                }))
                .isInstanceOf(IllegalStateException.class);
        assertThat(users.isActive(user)).isTrue();
        assertThat(users.readerEpoch(user)).isEqualTo(issued);

        assertThat(owner.queryForObject("select to_regclass('shared.identity_publications') is null", Boolean.class))
                .isTrue();
    }

    private Fixture fixture() {
        String email = UUID.randomUUID() + "@reader.test", host = "docs-" + UUID.randomUUID() + ".test";
        var user = ((UserApi.RegisterResult.Registered) users.register(email, "Reader")).user();
        passwords.set(new PasswordApi.AccountId(user.value()), "password1");
        owner.update("update iam.users set verified=true where id=?", user.value());
        var tenant = ((TenantRegistryApi.ProvisionResult.Provisioned) tenants.provision("Reader " + UUID.randomUUID()))
                .tenant()
                .id();
        UUID site = scope.inTenant(tenant, () -> {
            var created = sites.create(new SiteApi.ActorId(user.value()), tenant.value(), "Private docs");
            var bound = (CustomDomainApi.BindResult.Bound) domains.bind(host, created.id());
            domains.verify(host, bound.domain().dnsToken());
            domains.setPrimary(host);
            return created.id();
        });
        return new Fixture(user.value(), tenant.value(), site, host);
    }

    private record Fixture(UUID user, UUID tenant, UUID site, String host) {}
}
