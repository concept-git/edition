package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import io.space.control.support.MinioFixture;
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * 对象存储不可用不是业务拒绝：上传必须 503、业务事务回滚、幂等记录不封存；
 * 已有页面元数据读取不受影响。独立测试类：停掉容器后不再复用。
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PageAttachmentObjectStoreOutageTest {
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

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void attachReturns503AndLeavesNoReferenceWhenTheObjectStoreIsDown() throws Exception {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@outage.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser("owner@outage.test");
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), "Outage", "owner@outage.test")
                .tenant()
                .id();
        String credential = credential(owner);
        UUID space = createSpaceUseCase
                .createSpace(credential, tenant, "Docs", "authored", key())
                .value()
                .id();
        String base = "/api/v1/tenants/" + tenant + "/spaces/" + space + "/pages";
        String created = mvc.perform(MockMvcRequestBuilders.post(base)
                        .header("Authorization", "Bearer " + credential)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Guide\",\"slug\":\"guide\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID page =
                UUID.fromString(new ObjectMapper().readTree(created).get("id").asText());
        String attachKey = key();

        minio.stop();

        mvc.perform(MockMvcRequestBuilders.multipart(base + "/" + page + "/attachments")
                        .file(new MockMultipartFile("file", "a.png", "image/png", PageMetadataAcceptanceTest.PNG))
                        .header("Authorization", "Bearer " + credential)
                        .header("Idempotency-Key", attachKey))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("dependency_unavailable"));

        assertThat(jdbc.queryForObject(
                        "select count(*) from authoring.attachments where page_id = ?", Long.class, page))
                .isZero();
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.idempotency_records where idempotency_key = ?",
                        Long.class,
                        attachKey))
                .isZero();
        mvc.perform(get(base + "/" + page).header("Authorization", "Bearer " + credential))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attachments.length()").value(0));
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

    private static String key() {
        return UUID.randomUUID().toString();
    }
}
