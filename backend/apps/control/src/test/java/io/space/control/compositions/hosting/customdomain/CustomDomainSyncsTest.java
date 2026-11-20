package io.space.control.compositions.hosting.customdomain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.authoring.termination.DeleteSiteUseCase;
import io.space.control.compositions.hosting.site.CreateSiteUseCase;
import io.space.control.compositions.hosting.site.SiteTypes;
import io.space.control.compositions.hosting.site.ViewSiteUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.resource.SiteNotFoundException;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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
class CustomDomainSyncsTest {
    @org.springframework.beans.factory.annotation.Autowired
    DeleteSiteUseCase deleteSiteUseCase;

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    BindDomainUseCase bindDomainUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewDomainUseCase viewDomainUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    VerifyDomainUseCase verifyDomainUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SetPrimaryDomainUseCase setPrimaryDomainUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    UnbindDomainUseCase unbindDomainUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListDomainsUseCase listDomainsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    AllowDomainUseCase allowDomainUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSiteUseCase createSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewSiteUseCase viewSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    ApiTokenApi tokens;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void bindProveVerifySetsPrimaryAndAskResolves() {
        TenantFixture tenant = tenant("Domain Core", "owner-core@domain-syncs.test");
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Docs", key())
                .value()
                .id();

        var bound = bindDomainUseCase
                .bindDomain(tenant.ownerCredential(), tenant.id(), site, "docs.acme.test", key())
                .value();
        assertThat(bound.verified()).isFalse();
        assertThat(bound.isPrimary()).isFalse();
        assertThat(bound.txtName()).isEqualTo("_space-challenge.docs.acme.test");
        assertThat(viewSiteUseCase
                        .viewSite(tenant.ownerCredential(), tenant.id(), site)
                        .domains())
                .extracting(SiteTypes.Domain::host)
                .containsExactly("docs.acme.test");
        assertThat(allowDomainUseCase.allowDomain("docs.acme.test")).isFalse();

        assertThatExceptionOfType(DomainNotProvenException.class)
                .isThrownBy(() -> verifyDomainUseCase.verifyDomain(
                        tenant.ownerCredential(), tenant.id(), site, "docs.acme.test", key()));

        seedTxt(bound.txtName(), bound.dnsToken());
        var verified = verifyDomainUseCase
                .verifyDomain(tenant.ownerCredential(), tenant.id(), site, "docs.acme.test", key())
                .value();
        assertThat(verified.verified()).isTrue();
        assertThat(verified.isPrimary()).isTrue();
        assertThat(allowDomainUseCase.allowDomain("docs.acme.test")).isTrue();
        assertThat(allowDomainUseCase.allowDomain("missing.acme.test")).isFalse();

        var replay = verifyDomainUseCase
                .verifyDomain(tenant.ownerCredential(), tenant.id(), site, "docs.acme.test", key())
                .value();
        assertThat(replay.isPrimary()).isTrue();
    }

    @Test
    void occupancySwitchUnbindAndDeleteRules() {
        TenantFixture first = tenant("Domain First", "owner-first@domain-syncs.test");
        TenantFixture second = tenant("Domain Second", "owner-second@domain-syncs.test");
        UUID site = createSiteUseCase
                .createSite(first.ownerCredential(), first.id(), "One", key())
                .value()
                .id();
        UUID foreign = createSiteUseCase
                .createSite(second.ownerCredential(), second.id(), "Foreign", key())
                .value()
                .id();

        bindDomainUseCase.bindDomain(first.ownerCredential(), first.id(), site, "shared.acme.test", key());
        assertThatExceptionOfType(DomainTakenException.class)
                .isThrownBy(() -> bindDomainUseCase.bindDomain(
                        second.ownerCredential(), second.id(), foreign, "shared.acme.test", key()));

        var firstHost = bindDomainUseCase
                .bindDomain(first.ownerCredential(), first.id(), site, "a.acme.test", key())
                .value();
        seedTxt(firstHost.txtName(), firstHost.dnsToken());
        verifyDomainUseCase.verifyDomain(first.ownerCredential(), first.id(), site, "a.acme.test", key());
        var secondHost = bindDomainUseCase
                .bindDomain(first.ownerCredential(), first.id(), site, "b.acme.test", key())
                .value();
        seedTxt(secondHost.txtName(), secondHost.dnsToken());
        verifyDomainUseCase.verifyDomain(first.ownerCredential(), first.id(), site, "b.acme.test", key());
        setPrimaryDomainUseCase.setPrimaryDomain(first.ownerCredential(), first.id(), site, "b.acme.test", key());
        assertThatExceptionOfType(DomainIsPrimaryException.class)
                .isThrownBy(() -> unbindDomainUseCase.unbindDomain(
                        first.ownerCredential(), first.id(), site, "b.acme.test", key()));
        unbindDomainUseCase.unbindDomain(first.ownerCredential(), first.id(), site, "a.acme.test", key());
        unbindDomainUseCase.unbindDomain(first.ownerCredential(), first.id(), site, "b.acme.test", key());
        assertThat(allowDomainUseCase.allowDomain("b.acme.test")).isFalse();

        unbindDomainUseCase.unbindDomain(first.ownerCredential(), first.id(), site, "shared.acme.test", key());
        bindDomainUseCase.bindDomain(first.ownerCredential(), first.id(), site, "keep.acme.test", key());
        var siteName = viewSiteUseCase
                .viewSite(first.ownerCredential(), first.id(), site)
                .name();
        assertThat(viewSiteUseCase
                        .viewSite(first.ownerCredential(), first.id(), site)
                        .allowedActions())
                .contains(SiteTypes.Action.DELETE);
        deleteSiteUseCase.deleteSite(first.ownerCredential(), first.id(), site, siteName, key());
        assertThat(allowDomainUseCase.allowDomain("keep.acme.test")).isFalse();
        assertThatExceptionOfType(SiteNotFoundException.class)
                .isThrownBy(() -> viewSiteUseCase.viewSite(first.ownerCredential(), first.id(), site));
    }

    @Test
    void expiredUnverifiedIsReclaimedAndTokensCannotWrite() {
        TenantFixture first = tenant("Domain Ttl", "owner-ttl@domain-syncs.test");
        TenantFixture second = tenant("Domain Ttl B", "owner-ttl-b@domain-syncs.test");
        UUID site = createSiteUseCase
                .createSite(first.ownerCredential(), first.id(), "Old", key())
                .value()
                .id();
        UUID foreign = createSiteUseCase
                .createSite(second.ownerCredential(), second.id(), "New", key())
                .value()
                .id();
        bindDomainUseCase.bindDomain(first.ownerCredential(), first.id(), site, "stale.acme.test", key());
        jdbc.update(
                "update hosting.custom_domains set created_at = now() - interval '4 days' where host = ?",
                "stale.acme.test");
        assertThatExceptionOfType(DomainNotFoundException.class)
                .isThrownBy(() ->
                        viewDomainUseCase.viewDomain(first.ownerCredential(), first.id(), site, "stale.acme.test"));
        assertThat(listDomainsUseCase
                        .listDomains(first.ownerCredential(), first.id(), java.util.Optional.empty(), null, 20)
                        .items())
                .extracting(CustomDomainTypes.TenantDomainSummary::host)
                .doesNotContain("stale.acme.test");
        var rebound = bindDomainUseCase
                .bindDomain(second.ownerCredential(), second.id(), foreign, "stale.acme.test", key())
                .value();
        assertThat(rebound.host()).isEqualTo("stale.acme.test");

        UUID space = createSpaceUseCase
                .createSpace(second.ownerCredential(), second.id(), "Bound", "authored", key())
                .value()
                .id();
        ApiTokenApi.IssueResult.Issued issued =
                tenantScope.inTenant(new TenantRegistryApi.TenantId(second.id()), () -> {
                    UUID ownerId = jdbc.queryForObject(
                            "select id from iam.users where email = ?", UUID.class, "owner-ttl-b@domain-syncs.test");
                    return (ApiTokenApi.IssueResult.Issued) tokens.issue(
                            ownerId,
                            second.id(),
                            space,
                            "Domain writer",
                            Set.of(ApiTokenApi.Scope.READ, ApiTokenApi.Scope.WRITE),
                            Instant.now().plus(1, ChronoUnit.DAYS));
                });
        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() ->
                        bindDomainUseCase.bindDomain(issued.secret(), second.id(), foreign, "token.acme.test", key()));
        assertThatExceptionOfType(DomainHostInvalidException.class)
                .isThrownBy(() -> bindDomainUseCase.bindDomain(
                        second.ownerCredential(), second.id(), foreign, "not a host", key()));
        assertThatExceptionOfType(DomainNotFoundException.class)
                .isThrownBy(() -> viewDomainUseCase.viewDomain(
                        second.ownerCredential(), second.id(), foreign, "missing.acme.test"));
    }

    private void seedTxt(String name, String value) {
        jdbc.update("insert into shared.dns_txt_stubs (name, value) values (?, ?) on conflict do nothing", name, value);
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@domain-syncs.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Domain User");
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        return registered.user();
    }

    private String credential(UserApi.UserId user) {
        var started = (SessionApi.StartResult.Started) sessions.start(
                new SessionApi.HolderId(user.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown");
        return started.credentials().accessToken();
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private record TenantFixture(UUID id, String ownerCredential) {}
}
