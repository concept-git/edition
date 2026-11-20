package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.flyway.autoconfigure.FlywayDataSource;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * 冒烟：应用可启动 + Flyway 五个上下文 baseline 在 PostgreSQL 18 上迁移通过
 * （uuidv7()/citext/多 schema 全部被真实数据库验证）。
 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class ApplicationSmokeTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    @FlywayDataSource
    DataSource migrationDataSource;

    @Test
    void contextLoadsAndSchemaMigrates() {
        var jdbc = new JdbcTemplate(migrationDataSource);
        assertThat(jdbc.queryForList(
                        "select script from shared.flyway_schema_history "
                                + "where success and version is not null order by installed_rank",
                        String.class))
                .containsExactly(
                        "V1__shared.sql",
                        "V2__iam.sql",
                        "V3__authoring.sql",
                        "V4__releases.sql",
                        "V5__hosting.sql",
                        "V6__content_plugins.sql",
                        "V7__content_types.sql",
                        "V8__publication_read_view.sql",
                        "V9__password_credentials.sql",
                        "V10__retire_credential_intents.sql",
                        "V11__canonical_reader_identity.sql",
                        "V12__canonical_reader_state.sql",
                        "V13__primary_search.sql",
                        "V14__retire_delivery_projections.sql");
        assertThat(jdbc.queryForObject("select to_regclass('shared.reader_history') is null", Boolean.class))
                .isTrue();
        assertThat(jdbc.queryForObject("select to_regclass('shared.reader_history_transfer') is null", Boolean.class))
                .isTrue();
        for (String removed : java.util.List.of(
                "iam.passwords",
                "shared.reader_bindings",
                "iam.session_revocations",
                "shared.identity_provisioning",
                "shared.delivery_publications",
                "shared.reader_security_publications",
                "shared.reader_state_erasures")) {
            assertThat(jdbc.queryForObject("select to_regclass(?) is null", Boolean.class, removed))
                    .isTrue();
        }
    }
}
