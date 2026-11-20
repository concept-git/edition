package io.space.control.compositions.authoring.termination;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.objectstore.api.ObjectStoreApi;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tenantregistry.api.*;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.space.ArchiveSpaceUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.hosting.site.CreateSiteUseCase;
import io.space.control.compositions.hosting.site.MountSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.*;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@SpringBootTest
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class TerminationScaleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Container
    static final MinIOContainer minio = MinioFixture.container();

    @DynamicPropertySource
    static void storage(DynamicPropertyRegistry properties) {
        MinioFixture.bind(properties, minio);
    }

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ArchiveSpaceUseCase archiveSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSiteUseCase createSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    MountSpaceUseCase mountSpaceUseCase;

    @Autowired
    PageApi pages;

    @Autowired
    SpaceApi spaceApi;

    @org.springframework.beans.factory.annotation.Autowired
    DeleteSpaceUseCase deleteSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DeleteSiteUseCase deleteSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PlanSpaceTerminationUseCase planSpaceTerminationUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PlanSiteTerminationUseCase planSiteTerminationUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PurgeExpiredUseCase purgeExpiredUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListDeletionsUseCase listDeletionsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RetryDeletionUseCase retryDeletionUseCase;

    @Autowired
    SourceObjectCleanup cleanup;

    @Autowired
    ObjectStoreApi objects;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    @Timeout(120)
    void tenThousandPagesWithTwoRetainedVersionsRevisionsAndSharedObjectsTerminateAtomically() throws Exception {
        MinioFixture.ensureBucket(minio);
        var tenant = tenant("Scale termination", "scale-terminal@test.example");
        UUID space = createSpaceUseCase
                .createSpace(credential(tenant.owner()), tenant.id(), "Scale", "authored", key())
                .value()
                .id();
        UUID keeper = createSpaceUseCase
                .createSpace(credential(tenant.owner()), tenant.id(), "Keeper", "authored", key())
                .value()
                .id();
        for (int n = 0; n < 2; n++) {
            UUID site = createSiteUseCase
                    .createSite(credential(tenant.owner()), tenant.id(), "Site " + n, key())
                    .value()
                    .id();
            mountSpaceUseCase.mountSpace(credential(tenant.owner()), tenant.id(), site, "docs", space, key());
        }
        jdbc.update(
                "insert into"
                        + " authoring.pages(tenant_id,title,format,content,revision,created_by_type,updated_by_type)"
                        + " select"
                        + " ?,'scale-'||n,'markdown',repeat(md5(n::text),320),2,'system','system' from"
                        + " generate_series(1,10000) n",
                tenant.id());
        jdbc.update(
                "insert into authoring.space_page_placements(space_id,page_id,slug) select"
                        + " ?,id,title from authoring.pages where tenant_id=? and title like 'scale-%'",
                space, tenant.id());
        jdbc.update(
                "insert into authoring.revisions(page_id,n,content,content_sha,actor_type) select"
                        + " id,n,content,encode(sha256(convert_to(content,'UTF8')),'hex'),'system' from"
                        + " authoring.pages cross join generate_series(1,2) n where tenant_id=? and"
                        + " title like 'scale-%'",
                tenant.id());
        UUID keptPage = tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            var created = (PageApi.CreateResult.Created)
                    pages.create(PageApi.Actor.system(), PageApi.Format.MARKDOWN, "Keeper");
            spaceApi.place(new SpaceApi.SpaceId(keeper), created.page().id(), "keeper");
            return created.page().id();
        });
        byte[] shared = "%PDF-1.7\nshared\n".getBytes(java.nio.charset.StandardCharsets.UTF_8),
                exclusive = "%PDF-1.7\nexclusive\n".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String
                sharedKey =
                        HexFormat.of()
                                .formatHex(java.security.MessageDigest.getInstance("SHA-256")
                                        .digest(shared)),
                exclusiveKey =
                        HexFormat.of()
                                .formatHex(java.security.MessageDigest.getInstance("SHA-256")
                                        .digest(exclusive));
        objects.putIfAbsent(sharedKey, shared, "application/pdf");
        objects.putIfAbsent(exclusiveKey, exclusive, "application/pdf");
        jdbc.update(
                "insert into authoring.attachments(page_id,filename,mime,size_bytes,storage_key)"
                        + " select id,'shared.pdf','application/pdf',?,? from authoring.pages where"
                        + " tenant_id=?",
                shared.length,
                sharedKey,
                tenant.id());
        jdbc.update(
                "insert into authoring.attachments(page_id,filename,mime,size_bytes,storage_key)"
                        + " select id,'exclusive.pdf','application/pdf',?,? from authoring.pages where"
                        + " tenant_id=? and title='scale-1'",
                exclusive.length,
                exclusiveKey,
                tenant.id());
        jdbc.update(
                "insert into releases.release_contents(tenant_id,content_hash,body) select"
                        + " tenant_id,encode(sha256(convert_to(content,'UTF8')),'hex'),content from"
                        + " authoring.pages where tenant_id=? and title like 'scale-%'",
                tenant.id());
        for (int version = 1; version <= 2; version++) {
            UUID release = UUID.randomUUID();
            jdbc.update(
                    "insert into"
                            + " releases.releases(id,space_id,status,label,source_kind,page_count)"
                            + " values(?,?,'archived',?,'build',10000)",
                    release,
                    space,
                    "retained-" + version);
            jdbc.update(
                    "insert into"
                            + " releases.release_pages(tenant_id,release_id,page_id,slug,title,format,seo,properties,attachments,content_hash,seq)"
                            + " select"
                            + " tenant_id,?,id,title,title,format,'{}'::jsonb,'{}'::jsonb,jsonb_build_array(jsonb_build_object('path','shared.pdf','storageKey',?::text,'sha256',?::text)),encode(sha256(convert_to(content,'UTF8')),'hex'),row_number()"
                            + " over(order by id) from authoring.pages where tenant_id=? and title like"
                            + " 'scale-%'",
                    release, sharedKey, sharedKey, tenant.id());
        }
        assertThat(jdbc.queryForObject(
                        "select avg(octet_length(content)) from authoring.pages where"
                                + " tenant_id=? and title like 'scale-%'",
                        Double.class, tenant.id()))
                .isEqualTo(10240d);
        archiveSpaceUseCase.archiveSpace(credential(tenant.owner()), tenant.id(), space, key());
        long started = System.nanoTime();
        var deleted = deleteSpaceUseCase
                .deleteSpace(credential(tenant.owner()), tenant.id(), space, "Scale", key())
                .value();
        long millis = java.util.concurrent.TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started);
        assertThat(jdbc.queryForObject(
                        "select count(*) from authoring.pages where tenant_id=?", Long.class, tenant.id()))
                .isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from authoring.revisions", Long.class))
                .isZero();
        assertThat(jdbc.queryForObject("select count(*) from releases.releases where space_id=?", Long.class, space))
                .isZero();
        assertThat(jdbc.queryForObject("select count(*) from hosting.site_mounts where space_id=?", Long.class, space))
                .isZero();
        assertThat(objects.exists(sharedKey)).isTrue();
        assertThat(objects.exists(exclusiveKey)).isTrue();
        // Advance only the fixture's protection deadlines, instead of waiting two wall-clock hours.
        jdbc.update(
                "update shared.source_objects set protected_until=now()-interval '1"
                        + " second',next_retry_at=now()-interval '1 second' where storage_key=any(?)",
                (Object) new String[] {sharedKey, exclusiveKey});
        cleanup.collect();
        cleanup.reconcile(tenant.id());
        assertThat(objects.exists(sharedKey)).isTrue();
        assertThat(objects.exists(exclusiveKey)).isFalse();
        assertThat(listDeletionsUseCase
                        .listDeletions(credential(tenant.owner()), tenant.id(), null, 20)
                        .items())
                .anySatisfy(item -> {
                    assertThat(item.id()).isEqualTo(deleted.id());
                    assertThat(item.status()).isEqualTo("completed");
                });
        System.out.println("TERMINATION_SCALE pages=10000 bodyBytes=10240 revisions=20000"
                + " retainedSnapshots=20000 mounts=2 sharedObjectRetained=true"
                + " exclusiveObjectCollected=true deletionMs="
                + millis);
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@site-syncs.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, owner);
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Site User");
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

    private record TenantFixture(UUID id, UserApi.UserId owner) {}
}
