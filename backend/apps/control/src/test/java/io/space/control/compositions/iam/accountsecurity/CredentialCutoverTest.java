package io.space.control.compositions.iam.accountsecurity;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** An unfinished remote change must not become a valid old session after removing its fence. */
@Testcontainers
class CredentialCutoverTest {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Test
    void upgradeEndsOnlySessionsWithUnfinishedRevocationsBeforeRetiringIntents() {
        var dataSource =
                new DriverManagerDataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        var jdbc = new JdbcTemplate(dataSource);
        Flyway.configure()
                .dataSource(dataSource)
                .schemas("shared", "iam", "authoring", "releases", "hosting")
                .target("7")
                .load()
                .migrate();
        UUID fenced = UUID.randomUUID(), unaffected = UUID.randomUUID();
        for (UUID user : java.util.List.of(fenced, unaffected)) {
            jdbc.update(
                    "insert into iam.sessions(principal_id,refresh_token_hash,expires_at) values(?,?,now()+interval '1 day')",
                    user,
                    user.toString());
        }
        jdbc.update(
                "insert into iam.session_revocations(operation_id,user_id,lease_until) values(?,?,now()+interval '1 minute')",
                UUID.randomUUID(),
                fenced);
        jdbc.update(
                "insert into shared.identity_provisioning(account_id,recover_after) values(?,now())",
                UUID.randomUUID());
        var latest = Flyway.configure()
                .dataSource(dataSource)
                .schemas("shared", "iam", "authoring", "releases", "hosting")
                .load();
        latest.migrate();
        assertThat(jdbc.queryForObject(
                        "select ended_at is not null from iam.sessions where principal_id=?", Boolean.class, fenced))
                .isTrue();
        assertThat(jdbc.queryForObject(
                        "select ended_at is null from iam.sessions where principal_id=?", Boolean.class, unaffected))
                .isTrue();
        assertThat(jdbc.queryForObject(
                        "select to_regclass('iam.session_revocations') is null and to_regclass('shared.identity_provisioning') is null",
                        Boolean.class))
                .isTrue();
        assertThat(latest.migrate().migrationsExecuted).isZero();
    }
}
