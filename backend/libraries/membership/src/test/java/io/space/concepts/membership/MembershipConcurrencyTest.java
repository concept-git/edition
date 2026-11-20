package io.space.concepts.membership;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import io.space.concepts.membership.api.*;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
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
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@org.springframework.context.annotation.Import(io.space.concepts.membership.adapters.MembershipConfiguration.class)
class MembershipConcurrencyTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    MembershipApi memberships;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    JdbcTemplate runtime;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate owner;

    @Test
    void overlappingReplacementsLeaveOnlyTheLastInvitationValid() throws Exception {
        UUID tenant = UUID.randomUUID();
        owner.update("insert into shared.tenants(id,name) values (?,?)", tenant, "Concurrent invitations");
        var tenantId = tenant;
        var group = MembershipApi.Group.tenant(tenant);
        String email = "replace@invite-concurrency.test";
        scope.inTenant(tenantId, () -> memberships.invite(group, email, MembershipApi.Role.MEMBER));
        var firstReady = new CountDownLatch(1);
        var releaseFirst = new CountDownLatch(1);
        String secondConnection = "invite-second-" + tenant;
        try (var pool = Executors.newFixedThreadPool(2)) {
            var first = pool.submit(() -> scope.inTenant(tenantId, () -> {
                var result = memberships.invite(group, email, MembershipApi.Role.MEMBER);
                firstReady.countDown();
                try {
                    if (!releaseFirst.await(10, TimeUnit.SECONDS))
                        throw new IllegalStateException("first invitation timed out");
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(interrupted);
                }
                return result;
            }));
            try {
                assertThat(firstReady.await(5, TimeUnit.SECONDS)).isTrue();
                var second = pool.submit(() -> scope.inTenant(tenantId, () -> {
                    runtime.queryForObject(
                            "select set_config('application_name',?,true)", String.class, secondConnection);
                    return memberships.invite(group, email, MembershipApi.Role.MEMBER);
                }));
                await().atMost(Duration.ofSeconds(5))
                        .untilAsserted(() -> assertThat(owner.queryForObject(
                                        "select count(*) from pg_stat_activity where application_name=? and wait_event_type='Lock'",
                                        Integer.class,
                                        secondConnection))
                                .isEqualTo(1));
                releaseFirst.countDown();
                var earlier = first.get(10, TimeUnit.SECONDS);
                var later = second.get(10, TimeUnit.SECONDS);
                scope.inTenant(tenantId, () -> {
                    assertThat(memberships.invitesOf(group, null, 20).invites()).hasSize(1);
                    assertThat(memberships.inviteOf(MembershipApi.InviteRef.ofToken(earlier.token())))
                            .isEmpty();
                    assertThat(memberships.inviteOf(MembershipApi.InviteRef.ofToken(later.token())))
                            .isPresent();
                });
            } finally {
                releaseFirst.countDown();
            }
        }
    }
}
