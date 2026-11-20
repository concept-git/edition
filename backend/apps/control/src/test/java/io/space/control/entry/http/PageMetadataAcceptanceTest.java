package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.space.ArchiveSpaceUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import io.space.control.support.MinioFixture;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 票 13：SEO / 图标 / 属性 / 附件的 HTTP 验收，真 PG + 真 MinIO。 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PageMetadataAcceptanceTest {
    static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 'I', 'H', 'D', 'R'};
    static final byte[] PDF = "%PDF-1.7\n%stub\n".getBytes(StandardCharsets.US_ASCII);

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Container
    static final MinIOContainer minio = MinioFixture.container();

    @DynamicPropertySource
    static void objectStore(DynamicPropertyRegistry registry) {
        MinioFixture.bind(registry, minio);
    }

    @BeforeAll
    static void bucket() {
        MinioFixture.ensureBucket(minio);
    }

    @Autowired
    MockMvc mvc;

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

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void seoAndIconAreMergePatchedWithoutTouchingTheContentBaseline() throws Exception {
        Fixture f = fixture("Seo", "owner@seo-http.test");

        mvc.perform(
                        authed(patch(f.resource() + "/seo"), f)
                                .contentType("application/merge-patch+json")
                                .content(
                                        "{\"description\":\"分页查询\",\"ogImage\":\"https://cdn.example.com/og.png\",\"noIndex\":true}"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-ETag", "\"rev-1\""))
                .andExpect(jsonPath("$.revision").value(1))
                .andExpect(jsonPath("$.seo.title").isEmpty())
                .andExpect(jsonPath("$.seo.description").value("分页查询"))
                .andExpect(jsonPath("$.seo.ogImage").value("https://cdn.example.com/og.png"))
                .andExpect(jsonPath("$.seo.noIndex").value(true));

        mvc.perform(authed(patch(f.resource() + "/seo"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"  Quick start  \",\"ogImage\":null}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seo.title").value("Quick start"))
                .andExpect(jsonPath("$.seo.description").value("分页查询"))
                .andExpect(jsonPath("$.seo.ogImage").isEmpty())
                .andExpect(jsonPath("$.seo.noIndex").value(true));

        mvc.perform(authed(patch(f.resource() + "/seo"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"))
                .andExpect(jsonPath("$.violations[0].field").value("seo"))
                .andExpect(jsonPath("$.violations[0].code").value("empty_patch"));
        mvc.perform(authed(patch(f.resource() + "/seo"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ogImage\":\"javascript:alert(1)\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.violations[0].field").value("ogImage"))
                .andExpect(jsonPath("$.violations[0].code").value("invalid_url"));
        mvc.perform(authed(patch(f.resource() + "/seo"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"" + "x".repeat(201) + "\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.violations[0].field").value("title"));

        mvc.perform(authed(put(f.resource() + "/icon"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"icon\":\"https://cdn.example.com/i.png\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.icon").value("https://cdn.example.com/i.png"));
        mvc.perform(authed(put(f.resource() + "/icon"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"icon\":null}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.icon").isEmpty());

        mvc.perform(get(f.resource()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-ETag", "\"rev-1\""))
                .andExpect(jsonPath("$.seo.title").value("Quick start"))
                .andExpect(jsonPath("$.content").value("# body"));
        mvc.perform(get(f.base()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].icon").isEmpty());
    }

    @Test
    void propertiesUpsertRemoveIdempotentlyAndRejectInvalidKeys() throws Exception {
        Fixture f = fixture("Props", "owner@props-http.test");

        mvc.perform(authed(put(f.resource() + "/properties/doc_type"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"api\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.properties.doc_type").value("api"));
        mvc.perform(authed(put(f.resource() + "/properties/product"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"ecs\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.properties.length()").value(2));
        mvc.perform(authed(put(f.resource() + "/properties/doc_type"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"guide\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.properties.doc_type").value("guide"))
                .andExpect(jsonPath("$.revision").value(1));

        mvc.perform(authed(delete(f.resource() + "/properties/product"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.properties.product").doesNotExist());
        mvc.perform(authed(delete(f.resource() + "/properties/product"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.properties.length()").value(1));

        mvc.perform(authed(put(f.resource() + "/properties/9bad"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"x\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"))
                .andExpect(jsonPath("$.violations[0].field").value("field"))
                .andExpect(jsonPath("$.violations[0].code").value("invalid_format"));
        mvc.perform(authed(put(f.resource() + "/properties/big"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"" + "界".repeat(1400) + "\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.violations[0].field").value("value"));

        mvc.perform(get(f.resource()).header("Authorization", f.authorization()))
                .andExpect(jsonPath("$.properties.doc_type").value("guide"))
                .andExpect(jsonPath("$.properties.length()").value(1));
    }

    @Test
    void attachmentsAreSniffedStoredByContentHashLinkedAndDetachedWithoutDeletingObjects() throws Exception {
        Fixture f = fixture("Files", "owner@files-http.test");
        String sha = sha256(PNG);

        String attachKey = key();
        String body = mvc.perform(upload(f, "diagram.png", "text/plain", PNG, attachKey))
                .andExpect(status().isCreated())
                .andExpect(header().string("X-Content-ETag", "\"rev-1\""))
                .andExpect(jsonPath("$.attachments.length()").value(1))
                .andExpect(jsonPath("$.attachments[0].filename").value("diagram.png"))
                .andExpect(jsonPath("$.attachments[0].mime").value("image/png"))
                .andExpect(jsonPath("$.attachments[0].sizeBytes").value(PNG.length))
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID ref = UUID.fromString(
                json.readTree(body).get("attachments").get(0).get("id").asText());
        assertThat(MinioFixture.objectExists(minio, sha)).isTrue();
        assertThat(jdbc.queryForObject("select storage_key from authoring.attachments where id = ?", String.class, ref))
                .isEqualTo(sha);

        mvc.perform(upload(f, "diagram.png", "text/plain", PNG, attachKey))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.attachments.length()").value(1))
                .andExpect(jsonPath("$.attachments[0].id").value(ref.toString()));
        mvc.perform(upload(f, "other.pdf", "application/pdf", PDF, attachKey))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("idempotency_key_reused"));

        mvc.perform(upload(f, "notes.txt", "image/png", "just text".getBytes(StandardCharsets.UTF_8), key()))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("file_type_unsupported"));
        mvc.perform(upload(f, "logo.svg", "image/svg+xml", "<svg/>".getBytes(StandardCharsets.UTF_8), key()))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("file_type_unsupported"));
        mvc.perform(upload(f, "huge.png", "image/png", new byte[10 * 1024 * 1024 + 1], key()))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("file_too_large"));
        mvc.perform(upload(f, "../escape.png", "image/png", PNG, key()))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"))
                .andExpect(jsonPath("$.violations[0].field").value("filename"));

        mvc.perform(get(f.resource() + "/attachments/" + ref).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.endsWith("/attachments/" + ref + "/content")))
                .andExpect(jsonPath("$.filename").value("diagram.png"))
                .andExpect(jsonPath("$.mime").value("image/png"))
                .andExpect(jsonPath("$.expiresAt").doesNotExist());
        mvc.perform(get(f.resource() + "/attachments/" + ref + "/content").header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                        .bytes(PNG))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Cache-Control", "private, no-store"));
        mvc.perform(get(f.resource()).header("Authorization", f.authorization()))
                .andExpect(jsonPath("$.attachments[0].url").doesNotExist());

        mvc.perform(authed(delete(f.resource() + "/attachments/" + ref), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attachments.length()").value(0));
        mvc.perform(authed(delete(f.resource() + "/attachments/" + ref), f)).andExpect(status().isOk());
        mvc.perform(get(f.resource() + "/attachments/" + ref).header("Authorization", f.authorization()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("attachment_not_found"));
        mvc.perform(get(f.resource() + "/attachments/" + ref + "/content").header("Authorization", f.authorization()))
                .andExpect(status().isNotFound());
        assertThat(MinioFixture.objectExists(minio, sha))
                .as("detach only drops the reference")
                .isTrue();
    }

    @Test
    void theFiftyFirstAttachmentIsRejected() throws Exception {
        Fixture f = fixture("Limit", "owner@limit-http.test");
        for (int index = 0; index < 50; index++) {
            mvc.perform(upload(f, "file-" + index + ".pdf", "application/pdf", PDF, key()))
                    .andExpect(status().isCreated());
        }
        mvc.perform(upload(f, "one-more.pdf", "application/pdf", PDF, key()))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("too_many_attachments"));
        assertThat(jdbc.queryForObject(
                        "select count(*) from authoring.attachments where page_id = ?", Long.class, f.page()))
                .isEqualTo(50L);
    }

    @Test
    void metadataMutationsStayReadOnlyForSyncedArchivedAndForeignTenants() throws Exception {
        Fixture f = fixture("Modes", "owner@meta-modes-http.test");
        UUID synced = createSpaceUseCase
                .createSpace(f.credential(), f.tenant(), "Synced", "synced", key())
                .value()
                .id();
        // synced 空间没有 authored 建页入口：直接以 owner 池落一页，验证写路径统一拒绝。
        UUID syncedPage = UUID.randomUUID();
        jdbc.update("""
                insert into authoring.pages (id, tenant_id, title, format, created_by_type, updated_by_type)
                values (?, ?, 'Imported', 'markdown', 'system', 'system')
                """, syncedPage, f.tenant());
        jdbc.update(
                "insert into authoring.space_page_placements (space_id, page_id, slug) values (?, ?, 'imported')",
                synced,
                syncedPage);
        String syncedResource = pagesPath(f.tenant(), synced) + "/" + syncedPage;
        mvc.perform(authed(patch(syncedResource + "/seo"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"x\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));
        mvc.perform(upload(
                        new Fixture(f.tenant(), synced, syncedPage, f.credential()), "a.png", "image/png", PNG, key()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));
        mvc.perform(get(syncedResource).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowedActions", containsInAnyOrder("read", "edit")));

        archiveSpaceUseCase.archiveSpace(f.credential(), f.tenant(), f.space(), key());
        mvc.perform(authed(put(f.resource() + "/properties/k"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"v\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
        mvc.perform(authed(delete(f.resource() + "/attachments/" + UUID.randomUUID()), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));

        Fixture other = fixture("Other", "owner@meta-other-http.test");
        mvc.perform(authed(put(pagesPath(other.tenant(), f.space()) + "/" + f.page() + "/icon"), other)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"icon\":null}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("page_not_found"));
        mvc.perform(get(pagesPath(other.tenant(), f.space()) + "/" + f.page() + "/attachments/" + UUID.randomUUID())
                        .header("Authorization", other.authorization()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("page_not_found"));
    }

    private MockMultipartHttpServletRequestBuilder upload(
            Fixture f, String filename, String declared, byte[] bytes, String key) {
        return MockMvcRequestBuilders.multipart(f.resource() + "/attachments")
                .file(new MockMultipartFile("file", filename, declared, bytes))
                .header("Authorization", f.authorization())
                .header("Idempotency-Key", key);
    }

    private static MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder, Fixture f) {
        return builder.header("Authorization", f.authorization()).header("Idempotency-Key", key());
    }

    private Fixture fixture(String name, String ownerEmail) throws Exception {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@meta-http.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        String credential = credential(owner);
        UUID space = createSpaceUseCase
                .createSpace(credential, tenant, name + " Docs", "authored", key())
                .value()
                .id();
        String created = mvc.perform(MockMvcRequestBuilders.post(pagesPath(tenant, space))
                        .header("Authorization", "Bearer " + credential)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Guide\",\"slug\":\"guide\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID page = UUID.fromString(json.readTree(created).get("id").asText());
        Fixture fixture = new Fixture(tenant, space, page, credential);
        mvc.perform(put(fixture.resource() + "/content")
                        .header("Authorization", fixture.authorization())
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"# body\"}"))
                .andExpect(status().isOk());
        return fixture;
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Author");
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

    private static String sha256(byte[] bytes) throws Exception {
        return HexFormat.of()
                .formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(bytes));
    }

    private static String pagesPath(UUID tenant, UUID space) {
        return "/api/v1/tenants/" + tenant + "/spaces/" + space + "/pages";
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private record Fixture(UUID tenant, UUID space, UUID page, String credential) {
        String base() {
            return pagesPath(tenant, space);
        }

        String resource() {
            return base() + "/" + page;
        }

        String authorization() {
            return "Bearer " + credential;
        }
    }
}
