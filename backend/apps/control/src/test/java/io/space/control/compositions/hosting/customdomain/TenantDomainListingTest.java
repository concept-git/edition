package io.space.control.compositions.hosting.customdomain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.authoring.permission.PutSiteGrantUseCase;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.hosting.site.CreateSiteUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.Optional;
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

/** sync listDomains：跨站点按 host 分页、可读收窄、写能力投影与游标错误。 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class TenantDomainListingTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    BindDomainUseCase bindDomainUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListDomainsUseCase listDomainsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSiteUseCase createSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PutSiteGrantUseCase putSiteGrantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void listsHostsAcrossSitesInHostOrderWithCursor() {
        TenantFixture tenant = tenant("Domain Index", "owner@domain-index.test");
        UUID docs = site(tenant, "Docs");
        UUID blog = site(tenant, "Blog");
        bind(tenant, docs, "c.index.test");
        bind(tenant, blog, "a.index.test");
        bind(tenant, docs, "b.index.test");

        var page = listDomainsUseCase.listDomains(tenant.credential(), tenant.id(), Optional.empty(), null, 2);
        assertThat(page.items())
                .extracting(CustomDomainTypes.TenantDomainSummary::host)
                .containsExactly("a.index.test", "b.index.test");
        assertThat(page.items().getFirst().siteName()).isEqualTo("Blog");
        assertThat(page.items().getFirst().allowedActions()).contains(CustomDomainTypes.DomainAction.UPDATE);
        assertThat(page.total()).isNull();
        assertThat(page.sites())
                .extracting(CustomDomainTypes.DomainSiteChoice::name)
                .containsExactly("Blog", "Docs");
        assertThat(page.sites().getFirst().allowedActions()).contains(CustomDomainTypes.DomainAction.BIND);

        var rest = listDomainsUseCase.listDomains(
                tenant.credential(), tenant.id(), Optional.empty(), page.nextCursor(), 2);
        assertThat(rest.items())
                .extracting(CustomDomainTypes.TenantDomainSummary::host)
                .containsExactly("c.index.test");
        assertThat(rest.nextCursor()).isNull();

        var filtered = listDomainsUseCase.listDomains(tenant.credential(), tenant.id(), Optional.of(blog), null, 20);
        assertThat(filtered.items())
                .extracting(CustomDomainTypes.TenantDomainSummary::host)
                .containsExactly("a.index.test");
        assertThat(listDomainsUseCase
                        .listDomains(tenant.credential(), tenant.id(), Optional.of(UUID.randomUUID()), null, 20)
                        .items())
                .isEmpty();
    }

    @Test
    void readersSeeOnlyReadableSitesWithoutWriteActions() {
        TenantFixture tenant = tenant("Domain Reader", "owner@domain-reader.test");
        TenantFixture other = tenant("Domain Other", "owner@domain-other.test");
        UUID granted = site(tenant, "Granted");
        UUID hidden = site(tenant, "Hidden");
        bind(tenant, granted, "granted.reader.test");
        bind(tenant, hidden, "hidden.reader.test");
        bind(other, site(other, "Foreign"), "foreign.reader.test");

        UserApi.UserId reader = verifiedUser("reader@domain-reader.test");
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(reader.value()),
                        MembershipApi.Role.MEMBER));
        putSiteGrantUseCase.putSiteGrant(tenant.credential(), tenant.id(), granted, "user:" + reader.value(), "reader");

        var page = listDomainsUseCase.listDomains(credential(reader), tenant.id(), Optional.empty(), null, 20);
        assertThat(page.items())
                .extracting(CustomDomainTypes.TenantDomainSummary::host)
                .containsExactly("granted.reader.test");
        assertThat(page.items().getFirst().allowedActions()).isEmpty();
        assertThat(page.sites())
                .extracting(CustomDomainTypes.DomainSiteChoice::id)
                .containsExactly(granted);
        assertThat(page.sites().getFirst().allowedActions()).isEmpty();

        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() ->
                        listDomainsUseCase.listDomains(other.credential(), tenant.id(), Optional.empty(), null, 20));
        assertThatExceptionOfType(InvalidCursorException.class)
                .isThrownBy(() ->
                        listDomainsUseCase.listDomains(tenant.credential(), tenant.id(), Optional.empty(), "%%%", 20));
    }

    private UUID site(TenantFixture tenant, String name) {
        return createSiteUseCase
                .createSite(tenant.credential(), tenant.id(), name, key())
                .value()
                .id();
    }

    private void bind(TenantFixture tenant, UUID site, String host) {
        bindDomainUseCase.bindDomain(tenant.credential(), tenant.id(), site, host, key());
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@domain-index.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Domain Index");
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

    private record TenantFixture(UUID id, String credential) {}
}
