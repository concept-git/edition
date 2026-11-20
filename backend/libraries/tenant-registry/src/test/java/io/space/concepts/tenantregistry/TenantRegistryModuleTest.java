package io.space.concepts.tenantregistry;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.tenantregistry.api.*;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.ProvisionResult;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.Status;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.TenantId;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.View;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 登记处的操作契约（CONCEPT.md § actions）。 */
@ApplicationModuleTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(
        io.space.concepts.tenantregistry.adapters.TenantRegistryConfiguration.class)
class TenantRegistryModuleTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    TenantRegistryApi tenants;

    @Test
    void provisionRegistersAnActiveTenant(PublishedEvents events) {
        var provisioned = provision("Acme Docs");

        assertThat(provisioned.status()).isEqualTo(Status.ACTIVE);
        assertThat(provisioned.name()).isEqualTo("Acme Docs");
        assertThat(tenants.status(provisioned.id())).contains(Status.ACTIVE);
        assertThat(tenants.view(provisioned.id())).contains(provisioned);
        assertThat(events.ofType(TenantEvents.Provisioned.class)).hasSize(1);
    }

    @Test
    void provisionRejectsAnInvalidNameWithoutRegisteringAnything() {
        var result = tenants.provision("   ");

        assertThat(result).isInstanceOf(ProvisionResult.InvalidName.class);
    }

    /** 同名租户合法：租户以稳定 id 指代，不靠名字区分。 */
    @Test
    void provisionAllowsDuplicateNames() {
        var first = provision("Duplicated Name");
        var second = provision("Duplicated Name");

        assertThat(first.id()).isNotEqualTo(second.id());
    }

    @Test
    void suspendAndResumeAreIdempotent(PublishedEvents events) {
        var tenant = provision("Freeze Me").id();

        tenants.suspend(tenant);
        tenants.suspend(tenant);
        assertThat(tenants.status(tenant)).contains(Status.SUSPENDED);

        tenants.resume(tenant);
        tenants.resume(tenant);
        assertThat(tenants.status(tenant)).contains(Status.ACTIVE);

        assertThat(events.ofType(TenantEvents.Suspended.class)).hasSize(2);
        assertThat(events.ofType(TenantEvents.Resumed.class)).hasSize(2);
    }

    @Test
    void statusOfAnUnknownTenantIsEmptySoCallersCanAnswer404() {
        assertThat(tenants.status(new TenantId(UUID.randomUUID()))).isEmpty();
        assertThat(tenants.view(new TenantId(UUID.randomUUID()))).isEmpty();
    }

    @Test
    void viewsOfReturnsOnlyTheRequestedTenants() {
        var wanted = provision("Wanted").id();
        provision("Unwanted");

        assertThat(tenants.viewsOf(List.of(wanted))).extracting(View::id).containsExactly(wanted);
        assertThat(tenants.viewsOf(List.of())).isEmpty();
    }

    @Test
    void listWalksEveryTenantExactlyOnceAcrossCursorPages() {
        var registered = List.of(
                provision("Page A").id(), provision("Page B").id(),
                provision("Page C").id(), provision("Page D").id());

        var seen = new java.util.ArrayList<TenantId>();
        String cursor = null;
        do {
            var page = tenants.list(cursor, 2);
            assertThat(page.tenants()).hasSizeLessThanOrEqualTo(2);
            page.tenants().forEach(view -> seen.add(view.id()));
            cursor = page.nextCursor();
        } while (cursor != null);

        assertThat(seen).containsAll(registered).doesNotHaveDuplicates();
    }

    @Test
    void listRejectsAMalformedCursorSoTheGatewayCanAnswer400() {
        assertThatThrownBy(() -> tenants.list("not-a-cursor", 20)).isInstanceOf(IllegalArgumentException.class);
    }

    private View provision(String name) {
        return switch (tenants.provision(name)) {
            case ProvisionResult.Provisioned ok -> ok.tenant();
            case ProvisionResult.InvalidName invalid ->
                throw new AssertionError("unexpected invalid name: " + invalid.reason());
        };
    }
}
