package io.space.concepts.customdomain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.customdomain.api.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@org.springframework.transaction.annotation.Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(io.space.concepts.customdomain.adapters.CustomDomainConfiguration.class)
class CustomDomainModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    CustomDomainApi domains;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void bindThenVerifyThenResolveReachesTheTarget(PublishedEvents events) {
        UUID site = site();
        var bound = (CustomDomainApi.BindResult.Bound) domains.bind("docs.acme.test", site);
        assertThat(bound.domain().verified()).isFalse();
        assertThat(bound.domain().txtName()).isEqualTo("_space-challenge.docs.acme.test");
        assertThat(bound.domain().dnsToken()).isNotBlank();

        var replay = (CustomDomainApi.BindResult.Bound) domains.bind("Docs.Acme.TEST", site);
        assertThat(replay.domain().dnsToken()).isEqualTo(bound.domain().dnsToken());

        var verified = (CustomDomainApi.VerifyResult.Verified)
                domains.verify("docs.acme.test", bound.domain().dnsToken());
        assertThat(verified.domain().verified()).isTrue();
        assertThat(domains.setPrimary("docs.acme.test")).isInstanceOf(CustomDomainApi.SetPrimaryResult.Changed.class);
        assertThat(domains.resolve("docs.acme.test").orElseThrow().target()).isEqualTo(site);
        assertThat(domains.primaryOf(site)).contains("docs.acme.test");
        assertThat(domains.hostsOf(site)).extracting(CustomDomainApi.View::host).containsExactly("docs.acme.test");
        assertThat(events.ofType(CustomDomainEvents.Bound.class)).hasSize(1);
        assertThat(events.ofType(CustomDomainEvents.Verified.class)).hasSize(1);
    }

    @Test
    void bindOccupiesTheHostAndWrongTokenIsNotProven() {
        UUID first = site();
        UUID second = site();
        context(first);
        var bound = (CustomDomainApi.BindResult.Bound) domains.bind("taken.acme.test", first);
        assertThat(domains.bind("taken.acme.test", second)).isInstanceOf(CustomDomainApi.BindResult.Taken.class);
        assertThat(domains.verify("taken.acme.test", "wrong-token"))
                .isInstanceOf(CustomDomainApi.VerifyResult.NotProven.class);
        assertThat(domains.setPrimary("taken.acme.test"))
                .isInstanceOf(CustomDomainApi.SetPrimaryResult.NotVerified.class);
        domains.unbind("taken.acme.test");
        assertThat(domains.resolve("taken.acme.test")).isEmpty();
        assertThat(domains.unbind("missing.acme.test")).isInstanceOf(CustomDomainApi.UnbindResult.Unbound.class);
        assertThat(bound.domain().host()).isEqualTo("taken.acme.test");
    }

    @Test
    void primaryHostMustAlreadyBeVerified() {
        UUID site = site();
        assertThatThrownBy(() -> jdbc.update("""
                insert into hosting.custom_domains(host, site_id, verified, is_primary, dns_token)
                values ('primary.unverified.test', ?, false, true, 'tok')
                """, site)).isInstanceOf(DataIntegrityViolationException.class);
    }

    private void context(UUID site) {
        UUID tenant = fixtures.queryForObject("select tenant_id from hosting.sites where id=?", UUID.class, site);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
    }

    private UUID site() {
        UUID tenant = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", tenant, "Tenant " + tenant);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        UUID site = UUID.randomUUID();
        fixtures.update("""
                insert into hosting.sites (id, tenant_id, name, created_by, updated_by)
                values (?, ?, 'Docs', ?, ?)
                """, site, tenant, UUID.randomUUID(), UUID.randomUUID());
        return site;
    }
}
