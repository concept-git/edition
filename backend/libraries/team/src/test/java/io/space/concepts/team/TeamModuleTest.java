package io.space.concepts.team;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.team.api.*;
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
@org.springframework.context.annotation.Import(io.space.concepts.team.adapters.TeamConfiguration.class)
class TeamModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    TeamApi teams;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void createRenameListAndDeleteKeepStableIdentity() {
        UUID tenant = tenant();
        var created = (TeamApi.CreateResult.Created) teams.create(tenant, " Platform ");

        assertThat(created.team().name()).isEqualTo("Platform");
        assertThat(teams.list(tenant, null, 20).teams()).containsExactly(created.team());
        var renamed = (TeamApi.RenameResult.Renamed) teams.rename(created.team().id(), "Docs");
        assertThat(renamed.team().id()).isEqualTo(created.team().id());
        assertThat(renamed.team().name()).isEqualTo("Docs");
        assertThat(teams.delete(created.team().id())).isInstanceOf(TeamApi.DeleteResult.Deleted.class);
        assertThat(teams.view(created.team().id())).isEmpty();
    }

    @Test
    void normalizedNameIsUniqueInsideOneTenantButReusableAcrossTenants() {
        UUID first = tenant();
        UUID second = tenant();
        context(first);
        assertThat(teams.create(first, "Platform")).isInstanceOf(TeamApi.CreateResult.Created.class);
        assertThat(teams.create(first, "  platform  ")).isInstanceOf(TeamApi.CreateResult.NameTaken.class);
        context(second);
        assertThat(teams.create(second, "PLATFORM")).isInstanceOf(TeamApi.CreateResult.Created.class);
    }

    @Test
    void invalidAndMissingCasesAreFinite() {
        assertThat(teams.create(tenant(), "   ")).isInstanceOf(TeamApi.CreateResult.InvalidName.class);
        var missing = new TeamApi.TeamId(UUID.randomUUID());
        assertThat(teams.rename(missing, "Name")).isInstanceOf(TeamApi.RenameResult.NotFound.class);
        assertThat(teams.delete(missing)).isInstanceOf(TeamApi.DeleteResult.NotFound.class);
    }

    private void context(UUID tenant) {
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
    }

    private UUID tenant() {
        UUID id = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", id, "Tenant " + id);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, id.toString());
        return id;
    }
}
