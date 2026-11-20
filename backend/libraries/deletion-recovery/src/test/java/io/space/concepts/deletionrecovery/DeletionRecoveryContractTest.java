package io.space.concepts.deletionrecovery;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.deletionrecovery.api.*;
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
        io.space.concepts.deletionrecovery.adapters.DeletionRecoveryConfiguration.class)
class DeletionRecoveryContractTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    DeletionRecoveryApi api;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void retriesReuseTheOriginalDeletionAndCompletionIsTerminal() {
        UUID tenant = UUID.randomUUID(), target = UUID.randomUUID(), actor = UUID.randomUUID();
        scope.inTenant(tenant, () -> {
            var deletion = api.deleted(tenant, "space", target, actor, Set.of("object"), Set.of());
            assertThat(api.deleted(tenant, "space", target, actor, Set.of(), Set.of())
                            .id())
                    .isEqualTo(deletion.id());
            api.finish(target, "failed", "dependency_unavailable");
            api.retry(target);
            assertThat(api.deletion(target).orElseThrow().status()).isEqualTo("queued");
            api.finish(target, "completed", null);
            api.retry(target);
            api.finish(target, "failed", "later");
            assertThat(api.deletion(target).orElseThrow().status()).isEqualTo("completed");
            assertThat(api.deletion(target).orElseThrow().objects()).containsExactly("object");
        });
    }
}
