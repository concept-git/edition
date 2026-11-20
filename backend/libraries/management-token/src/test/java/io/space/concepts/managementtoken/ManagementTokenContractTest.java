package io.space.concepts.managementtoken;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.managementtoken.api.*;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@Testcontainers
@org.springframework.test.annotation.DirtiesContext(
        classMode = org.springframework.test.annotation.DirtiesContext.ClassMode.AFTER_CLASS)
@SpringBootTest(
        classes = io.space.ConceptTestApplication.class,
        properties = {})
@org.springframework.context.annotation.Import(
        io.space.concepts.managementtoken.adapters.ManagementTokenConfiguration.class)
class ManagementTokenContractTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    ManagementTokenApi api;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void issueAuthenticateAndRevokeKeepOwnershipAndNeverExposeStoredSecrets() {
        UUID owner = UUID.randomUUID();
        fixtures.update(
                "insert into iam.users(id,email,name) values(?,?,'Token owner')", owner, owner + "@example.invalid");
        assertThat(api.issue(owner, "Token", Set.of(), null, Instant.now().plusSeconds(3600)))
                .isInstanceOf(ManagementTokenApi.IssueResult.InvalidScope.class);
        var token = (ManagementTokenApi.IssueResult.Issued) api.issue(
                owner,
                "Token",
                Set.of(ManagementTokenApi.Scope.CONTENT_READ),
                null,
                Instant.now().plusSeconds(3600));
        assertThat(api.authenticate(token.secret()))
                .isInstanceOf(ManagementTokenApi.Authentication.Authenticated.class);
        api.revoke(token.metadata().id(), UUID.randomUUID());
        assertThat(api.authenticate(token.secret()))
                .isInstanceOf(ManagementTokenApi.Authentication.Authenticated.class);
        api.revoke(token.metadata().id(), owner);
        assertThat(api.authenticate(token.secret())).isInstanceOf(ManagementTokenApi.Authentication.Invalid.class);
        assertThat(token.toString()).doesNotContain(token.secret());
    }
}
