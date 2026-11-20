package io.space.concepts.apitoken;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.apitoken.api.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@org.springframework.transaction.annotation.Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(io.space.concepts.apitoken.adapters.ApiTokenConfiguration.class)
class ApiTokenModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    ApiTokenApi tokens;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    // OP: after issue then _authenticate returns the token itself (not the owner)
    @Test
    void issueStoresOnlySha256AndAuthenticatesByTokenId() {
        Fixture fixture = fixture();
        var issued = (ApiTokenApi.IssueResult.Issued) tokens.issue(
                fixture.owner(),
                fixture.tenant(),
                fixture.space(),
                "CI",
                Set.of(ApiTokenApi.Scope.READ, ApiTokenApi.Scope.PUBLISH),
                Instant.now().plus(1, ChronoUnit.DAYS));

        assertThat(issued.secret()).matches("^spc_" + issued.metadata().id().value() + "_[A-Za-z0-9_-]{43}$");
        assertThat(jdbc.queryForObject(
                        "select octet_length(secret_hash) from iam.api_tokens where id = ?",
                        Integer.class,
                        issued.metadata().id().value()))
                .isEqualTo(32);
        assertThat(jdbc.queryForObject(
                        "select encode(secret_hash, 'hex') from iam.api_tokens where id = ?",
                        String.class,
                        issued.metadata().id().value()))
                .doesNotContain(issued.secret());
        assertThat(tokens.authenticate(issued.secret()))
                .isInstanceOfSatisfying(ApiTokenApi.Authentication.Authenticated.class, authenticated -> {
                    assertThat(authenticated.token())
                            .isEqualTo(issued.metadata().id());
                    assertThat(authenticated.tenant()).isEqualTo(fixture.tenant());
                    assertThat(authenticated.space()).isEqualTo(fixture.space());
                    assertThat(authenticated.scopes())
                            .containsExactlyInAnyOrder(ApiTokenApi.Scope.READ, ApiTokenApi.Scope.PUBLISH);
                });

        String wrong = issued.secret().substring(0, issued.secret().length() - 1)
                + (issued.secret().endsWith("A") ? "B" : "A");
        assertThat(tokens.authenticate(wrong)).isInstanceOf(ApiTokenApi.Authentication.Invalid.class);
        assertThat(tokens.authenticate("spc_invalid")).isInstanceOf(ApiTokenApi.Authentication.Invalid.class);
    }

    @Test
    void invalidScopeAndExpiryAreRejectedAndRevocationIsSoft() {
        Fixture fixture = fixture();
        assertThat(tokens.issue(
                        fixture.owner(),
                        fixture.tenant(),
                        fixture.space(),
                        "empty",
                        Set.of(),
                        Instant.now().plusSeconds(10)))
                .isInstanceOf(ApiTokenApi.IssueResult.InvalidScope.class);
        assertThat(tokens.issue(
                        fixture.owner(),
                        fixture.tenant(),
                        fixture.space(),
                        "past",
                        Set.of(ApiTokenApi.Scope.READ),
                        Instant.now().minusSeconds(1)))
                .isInstanceOf(ApiTokenApi.IssueResult.InvalidExpiry.class);
        assertThat(tokens.issue(
                        fixture.owner(),
                        fixture.tenant(),
                        fixture.space(),
                        "too-long",
                        Set.of(ApiTokenApi.Scope.READ),
                        Instant.now().plus(366, ChronoUnit.DAYS)))
                .isInstanceOf(ApiTokenApi.IssueResult.InvalidExpiry.class);

        var issued = (ApiTokenApi.IssueResult.Issued) tokens.issue(
                fixture.owner(),
                fixture.tenant(),
                fixture.space(),
                "revoke",
                Set.of(ApiTokenApi.Scope.READ),
                Instant.now().plusSeconds(60));
        tokens.revoke(issued.metadata().id());

        assertThat(tokens.authenticate(issued.secret())).isInstanceOf(ApiTokenApi.Authentication.Invalid.class);
        assertThat(tokens.ownedBy(fixture.owner(), fixture.tenant(), false)).isEmpty();
        assertThat(tokens.ownedBy(fixture.owner(), fixture.tenant(), true)).hasSize(1);
        assertThat(jdbc.queryForObject(
                        "select count(*) from iam.api_tokens where id = ?",
                        Long.class,
                        issued.metadata().id().value()))
                .isOne();
    }

    // OP: after anonymize then _authenticate is invalid and _metadata remains by stable id
    @Test
    void anonymizeKeepsTheIdButStopsAuthentication() {
        Fixture fixture = fixture();
        var issued = (ApiTokenApi.IssueResult.Issued) tokens.issue(
                fixture.owner(),
                fixture.tenant(),
                fixture.space(),
                "ci-docs",
                Set.of(ApiTokenApi.Scope.READ),
                Instant.now().plusSeconds(60));

        tokens.anonymize(issued.metadata().id());

        assertThat(tokens.authenticate(issued.secret())).isInstanceOf(ApiTokenApi.Authentication.Invalid.class);
        ApiTokenApi.Metadata metadata = tokens.metadata(issued.metadata().id()).orElseThrow();
        assertThat(metadata.id()).isEqualTo(issued.metadata().id());
        assertThat(metadata.name()).isEqualTo("已注销令牌");
        assertThat(metadata.revokedAt()).isNotNull();
    }

    private Fixture fixture() {
        UUID owner = UUID.randomUUID();
        UUID tenant = UUID.randomUUID();
        UUID space = UUID.randomUUID();
        fixtures.update(
                "insert into iam.users(id,email,name,verified) values (?,?,?,true)",
                owner,
                owner + "@token-module.test",
                "Owner");
        fixtures.update("insert into shared.tenants(id,name) values (?,?)", tenant, "Tenant");
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        fixtures.update("""
                insert into authoring.spaces(id,tenant_id,name,mode)
                values (?,?,?,'authored')
                """, space, tenant, "Space");
        return new Fixture(owner, tenant, space);
    }

    private record Fixture(UUID owner, UUID tenant, UUID space) {}
}
