package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * 票 05 的端到端验收（后端侧）：开通、邀请、接受、角色、冻结。
 * 场景编号对应 .scratch/dw-v1/issues/05-tenant-invitations.md 的验收清单。
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class TenantProvisioningAcceptanceTest {

    private static final String ORIGIN = "http://localhost:8088";

    /** 登录限流按来源 IP 计（票 04）：本类要登录几十次，故每次换一个测试网段地址。 */
    private static final AtomicInteger CALLER = new AtomicInteger();

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    MockMvc mvc;

    @Autowired
    UserApi users;

    @Autowired
    PasswordApi passwords;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    final ObjectMapper json = new ObjectMapper();

    /** ① 运营员开通租户（owner 已注册）→ owner 立刻可管理该租户。 */
    @Test
    void provisioningSeatsARegisteredOwnerWhoCanManageTheTenantImmediately() throws Exception {
        String operator = platformOperator("op1@tenant.test");
        createVerified("owner1@tenant.test", "password1");

        var provisioned = json.readTree(mvc.perform(post("/admin/tenants")
                        .header("Authorization", "Bearer " + operator)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Acme Docs","ownerEmail":"owner1@tenant.test"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenant.name").value("Acme Docs"))
                .andExpect(jsonPath("$.tenant.status").value("active"))
                .andExpect(jsonPath("$.tenant.ownerCount").value(1))
                .andExpect(jsonPath("$.ownerInviteToken").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString());
        String tenant = provisioned.at("/tenant/id").asText();

        String owner = login("owner1@tenant.test", "password1");
        mvc.perform(get("/api/v1/tenants/" + tenant + "/members").header("Authorization", "Bearer " + owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].role").value("owner"));
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + owner))
                .andExpect(jsonPath("$.tenants[0].name").value("Acme Docs"))
                .andExpect(jsonPath("$.tenants[0].role").value("owner"))
                .andExpect(jsonPath("$.platformOperator").value(false));
    }

    /** ② 开通租户（owner 未注册）→ 注册即入租并成为 owner。 */
    @Test
    void anUnregisteredOwnerJoinsAsOwnerOnSignUp() throws Exception {
        String operator = platformOperator("op2@tenant.test");

        var provisioned = json.readTree(mvc.perform(post("/admin/tenants")
                        .header("Authorization", "Bearer " + operator)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Greenfield","ownerEmail":"owner2@tenant.test"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tenant.ownerCount").value(0))
                .andExpect(jsonPath("$.ownerInviteToken").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString());
        String tenant = provisioned.at("/tenant/id").asText();

        register("owner2@tenant.test", "password1");
        verify("owner2@tenant.test");
        String owner = login("owner2@tenant.test", "password1");

        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + owner))
                .andExpect(jsonPath("$.tenants[0].id").value(tenant))
                .andExpect(jsonPath("$.tenants[0].role").value("owner"));
        // 租户根 admin 随 owner 身份到手：能立刻管理成员。
        mvc.perform(get("/api/v1/tenants/" + tenant + "/members").header("Authorization", "Bearer " + owner))
                .andExpect(status().isOk());
    }

    /** ③ 非运营员访问 /admin/tenants 得 403 platform_operator_required。 */
    @Test
    void theAdminPlaneIsClosedToOrdinaryUsers() throws Exception {
        createVerified("nobody@tenant.test", "password1");
        String ordinary = login("nobody@tenant.test", "password1");

        mvc.perform(get("/admin/tenants").header("Authorization", "Bearer " + ordinary))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("platform_operator_required"));
        mvc.perform(get("/admin/tenants"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("authentication_required"));
    }

    /** ④ 管理员邀请成员 → 受邀人接受 → 出现在成员列表。 */
    @Test
    void anInvitedUserJoinsAndShowsUpInTheMemberList() throws Exception {
        String tenant = provision("Invite Co", "owner4@tenant.test");
        String owner = login("owner4@tenant.test", "password1");
        createVerified("member4@tenant.test", "password1");

        String token = invite(owner, tenant, "member4@tenant.test", "member");
        mvc.perform(get("/api/v1/invitations/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kind").value("tenant"))
                .andExpect(jsonPath("$.tenant.name").value("Invite Co"))
                .andExpect(jsonPath("$.email").value("member4@tenant.test"));

        String invitee = login("member4@tenant.test", "password1");
        mvc.perform(post("/api/v1/invitations/" + token + ":accept").header("Authorization", "Bearer " + invitee))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kind").value("tenant"))
                .andExpect(jsonPath("$.tenant.name").value("Invite Co"))
                .andExpect(jsonPath("$.role").value("member"));

        mvc.perform(get("/api/v1/tenants/" + tenant + "/members").header("Authorization", "Bearer " + owner))
                .andExpect(jsonPath("$.items.length()").value(2));
        // 成员不是管理员：看不了成员列表。
        mvc.perform(get("/api/v1/tenants/" + tenant + "/members").header("Authorization", "Bearer " + invitee))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));
    }

    @Test
    void issuingAnInvitationRequiresAnIdempotencyKey() throws Exception {
        String tenant = provision("Key Required Co", "owner-key-required@tenant.test");
        String owner = login("owner-key-required@tenant.test", "password1");

        mvc.perform(post("/api/v1/tenants/" + tenant + "/invitations")
                        .header("Authorization", "Bearer " + owner)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"guest-key-required@tenant.test","role":"member"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_idempotency_key"));
    }

    /** ⑤ 邮箱错配接受 → 409；⑥ 撤销后 → 400。 */
    @Test
    void aForwardedInviteIsUselessToSomeoneElseAndRevocationKillsTheLink() throws Exception {
        String tenant = provision("Mismatch Co", "owner5@tenant.test");
        String owner = login("owner5@tenant.test", "password1");
        createVerified("intended@tenant.test", "password1");
        createVerified("stranger@tenant.test", "password1");

        String token = invite(owner, tenant, "intended@tenant.test", "member");
        String stranger = login("stranger@tenant.test", "password1");
        mvc.perform(post("/api/v1/invitations/" + token + ":accept").header("Authorization", "Bearer " + stranger))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("invite_email_mismatch"));

        var invites = json.readTree(mvc.perform(
                        get("/api/v1/tenants/" + tenant + "/invitations").header("Authorization", "Bearer " + owner))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());
        String inviteId = invites.at("/items/0/id").asText();
        mvc.perform(delete("/api/v1/tenants/" + tenant + "/invitations/" + inviteId)
                        .header("Authorization", "Bearer " + owner))
                .andExpect(status().isNoContent());

        String intended = login("intended@tenant.test", "password1");
        mvc.perform(post("/api/v1/invitations/" + token + ":accept").header("Authorization", "Bearer " + intended))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invite_invalid"));
    }

    /** ⑦ 重复邀请同邮箱 → 旧链接失效、新链接可用。 */
    @Test
    void reinvitingReplacesTheEarlierLink() throws Exception {
        String tenant = provision("Resend Co", "owner7@tenant.test");
        String owner = login("owner7@tenant.test", "password1");
        createVerified("resend@tenant.test", "password1");

        String first = invite(owner, tenant, "resend@tenant.test", "member");
        String second = invite(owner, tenant, "resend@tenant.test", "member");
        String invitee = login("resend@tenant.test", "password1");

        mvc.perform(post("/api/v1/invitations/" + first + ":accept").header("Authorization", "Bearer " + invitee))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invite_invalid"));
        mvc.perform(post("/api/v1/invitations/" + second + ":accept").header("Authorization", "Bearer " + invitee))
                .andExpect(status().isOk());
        // 已是成员：再邀请直接 409，不再签发链接。
        mvc.perform(post("/api/v1/tenants/" + tenant + "/invitations")
                        .header("Authorization", "Bearer " + owner)
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"resend@tenant.test","role":"member"}"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("already_member"));
    }

    /** ⑧ 冻结租户 → 该租户管理面 403，同用户在另一租户不受影响。 */
    @Test
    void suspensionFreezesOneTenantOnly() throws Exception {
        String operator = platformOperator("op8@tenant.test");
        createVerified("owner8@tenant.test", "password1");
        String frozen = provisionAs(operator, "Frozen Co", "owner8@tenant.test");
        String healthy = provisionAs(operator, "Healthy Co", "owner8@tenant.test");
        String owner = login("owner8@tenant.test", "password1");

        mvc.perform(post("/admin/tenants/" + frozen + ":suspend").header("Authorization", "Bearer " + operator))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/v1/tenants/" + frozen + "/members").header("Authorization", "Bearer " + owner))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("tenant_suspended"));
        mvc.perform(get("/api/v1/tenants/" + healthy + "/members").header("Authorization", "Bearer " + owner))
                .andExpect(status().isOk());
        // 会话不受影响：冻结不是下线。
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenants.length()").value(2));

        mvc.perform(post("/admin/tenants/" + frozen + ":resume").header("Authorization", "Bearer " + operator))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/tenants/" + frozen + "/members").header("Authorization", "Bearer " + owner))
                .andExpect(status().isOk());
    }

    /** ⑨ 提升为 owner → 立即获得租户根管理权；⑩ 移除最后一个 owner → 409。 */
    @Test
    void promotionGrantsRootAccessAndTheLastOwnerIsProtected() throws Exception {
        String tenant = provision("Roles Co", "owner9@tenant.test");
        String owner = login("owner9@tenant.test", "password1");
        createVerified("member9@tenant.test", "password1");
        String token = invite(owner, tenant, "member9@tenant.test", "member");
        String member = login("member9@tenant.test", "password1");
        mvc.perform(post("/api/v1/invitations/" + token + ":accept").header("Authorization", "Bearer " + member))
                .andExpect(status().isOk());
        UUID memberId = users.byEmail("member9@tenant.test").orElseThrow().value();

        mvc.perform(get("/api/v1/tenants/" + tenant + "/members").header("Authorization", "Bearer " + member))
                .andExpect(status().isForbidden());

        mvc.perform(patch("/api/v1/tenants/" + tenant + "/members/" + memberId)
                        .header("Authorization", "Bearer " + owner)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"role":"owner"}"""))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/tenants/" + tenant + "/members").header("Authorization", "Bearer " + member))
                .andExpect(status().isOk());

        // 降级回 member：租户根授权同步撤销。
        mvc.perform(patch("/api/v1/tenants/" + tenant + "/members/" + memberId)
                        .header("Authorization", "Bearer " + owner)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"role":"member"}"""))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/tenants/" + tenant + "/members").header("Authorization", "Bearer " + member))
                .andExpect(status().isForbidden());

        UUID ownerId = users.byEmail("owner9@tenant.test").orElseThrow().value();
        mvc.perform(delete("/api/v1/tenants/" + tenant + "/members/" + ownerId)
                        .header("Authorization", "Bearer " + owner))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("last_owner"));
    }

    /**
     * 运营员身份只解锁运维面：对租户内资源零隐式权限。
     * 少了这条，"最小特权"就只是文档里的说法。
     */
    @Test
    void aPlatformOperatorHasNoImplicitAccessInsideTheTenantItProvisioned() throws Exception {
        String operator = platformOperator("op11@tenant.test");
        createVerified("owner11@tenant.test", "password1");
        String tenant = provisionAs(operator, "Hands Off Co", "owner11@tenant.test");

        mvc.perform(get("/api/v1/tenants/" + tenant + "/members").header("Authorization", "Bearer " + operator))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));
    }

    /**
     * 租户根授权必须带 tenant_id：它默认取事务级 app.tenant_id，脱离租户作用域写入就会留 NULL，
     * 等票 29 打开 RLS 时这些行会变成没人看得见的孤儿。
     */
    @Test
    void ownerGrantsCarryTheirTenantForTheComingRowLevelSecurity() throws Exception {
        String tenant = provision("Stamped Co", "owner12@tenant.test");
        String owner = login("owner12@tenant.test", "password1");
        createVerified("member12@tenant.test", "password1");
        String token = invite(owner, tenant, "member12@tenant.test", "owner");
        String invitee = login("member12@tenant.test", "password1");
        mvc.perform(post("/api/v1/invitations/" + token + ":accept").header("Authorization", "Bearer " + invitee))
                .andExpect(status().isOk());

        var stamped = jdbc.queryForList(
                "select tenant_id from iam.permission_grants where resource_type = 'tenant' and resource_id = ?",
                UUID.class,
                UUID.fromString(tenant));

        assertThat(stamped).hasSize(2).allMatch(UUID.fromString(tenant)::equals);
    }

    @Test
    void aBlankTenantNameIsRejectedBeforeAnythingIsRegistered() throws Exception {
        String operator = platformOperator("op10@tenant.test");

        mvc.perform(post("/admin/tenants")
                        .header("Authorization", "Bearer " + operator)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"   ","ownerEmail":"someone@tenant.test"}"""))
                .andExpect(status().isUnprocessableContent());

        mvc.perform(post("/admin/tenants/" + UUID.randomUUID() + ":suspend")
                        .header("Authorization", "Bearer " + operator))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("tenant_not_found"));
    }

    @Test
    void anUnknownInviteTokenIsIndistinguishableFromAnExpiredOne() throws Exception {
        mvc.perform(get("/api/v1/invitations/not-a-real-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invite_invalid"));
    }

    @Test
    @org.junit.jupiter.api.extension.ExtendWith(org.springframework.boot.test.system.OutputCaptureExtension.class)
    void validExpiredAndInvalidPreviewTokensShareTheSameLimitWithoutLoggingTheToken(
            org.springframework.boot.test.system.CapturedOutput output) throws Exception {
        String ownerEmail = "preview-limit-owner@tenant.test";
        String tenant = provision("Preview limits", ownerEmail);
        String owner = login(ownerEmail, "password1");
        String valid = invite(owner, tenant, "preview-valid@tenant.test", "member");
        String expired = invite(owner, tenant, "preview-expired@tenant.test", "member");
        jdbc.update(
                "update iam.invites set expires_at=now()-interval '1 second' where email=?",
                "preview-expired@tenant.test");
        String invalid = "invalid-preview-" + UUID.randomUUID();
        int beginning = output.getAll().length();
        for (String token : java.util.List.of(valid, expired, invalid)) {
            for (int n = 0; n < 20; n++) {
                int caller = CALLER.incrementAndGet();
                mvc.perform(get("/api/v1/invitations/" + token)
                                .header("X-Forwarded-For", "203.0.%d.%d".formatted(caller / 250, caller % 250 + 1)))
                        .andExpect(status().is(token.equals(valid) ? 200 : 400));
            }
            var response = mvc.perform(get("/api/v1/invitations/" + token).header("X-Forwarded-For", "192.0.2.201"))
                    .andExpect(status().isTooManyRequests())
                    .andExpect(jsonPath("$.code").value("rate_limited"))
                    .andReturn()
                    .getResponse();
            assertThat(Long.parseLong(response.getHeader("Retry-After"))).isBetween(1L, 60L);
            assertThat(response.getContentAsString()).doesNotContain(token);
        }
        String previewLogs = output.getAll().substring(beginning);
        assertThat(previewLogs).doesNotContain(valid, expired, invalid);
    }

    @Test
    void malformedAuditFiltersAreValidationErrorsWithoutEchoingTheirValues() throws Exception {
        String actor = platformOperator("audit-invalid-filter@test.example");
        for (String field : java.util.List.of("actor", "from")) {
            var response = mvc.perform(get("/audit")
                            .header("Authorization", "Bearer " + actor)
                            .param(field, "invalid-secret-value"))
                    .andExpect(status().is(422))
                    .andExpect(jsonPath("$.code").value("validation_failed"))
                    .andExpect(jsonPath("$.violations[0].field").value(field))
                    .andReturn()
                    .getResponse();
            assertThat(response.getContentAsString()).doesNotContain("invalid-secret-value");
        }
    }

    // ---- fixtures ----

    private String provision(String name, String ownerEmail) throws Exception {
        String operator = platformOperator("op-" + UUID.randomUUID() + "@tenant.test");
        createVerified(ownerEmail, "password1");
        return provisionAs(operator, name, ownerEmail);
    }

    private String provisionAs(String operator, String name, String ownerEmail) throws Exception {
        var response = mvc.perform(post("/admin/tenants")
                        .header("Authorization", "Bearer " + operator)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new ProvisionBody(name, ownerEmail))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(response).at("/tenant/id").asText();
    }

    private String invite(String adminToken, String tenant, String email, String role) throws Exception {
        var response = mvc.perform(post("/api/v1/tenants/" + tenant + "/invitations")
                        .header("Authorization", "Bearer " + adminToken)
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new InviteBody(email, role))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode body = json.readTree(response);
        assertThat(body.at("/invite/email").asText()).isEqualTo(email);
        return body.at("/token").asText();
    }

    /** 运营员标记由运维手工置位（票 05 定稿），测试沿用同一条 SQL。 */
    private String platformOperator(String email) throws Exception {
        createVerified(email, "password1");
        jdbc.update("update iam.users set platform_operator = true where email = ?", email);
        return login(email, "password1");
    }

    private void createVerified(String email, String password) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "User " + email);
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        passwords.set(new PasswordApi.AccountId(registered.user().value()), password);
    }

    private void register(String email, String password) throws Exception {
        mvc.perform(post("/auth/register")
                        .header("Origin", ORIGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new RegisterBody(email, "User " + email, password))))
                .andExpect(status().isCreated());
    }

    private void verify(String email) {
        jdbc.update("update iam.users set verified = true where email = ?", email);
    }

    private String login(String email, String password) throws Exception {
        int caller = CALLER.incrementAndGet();
        var response = mvc.perform(post("/auth/login")
                        .header("Origin", ORIGIN)
                        .header("X-Forwarded-For", "203.0.%d.%d".formatted(caller / 250, caller % 250 + 1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new LoginBody(email, password))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(response).at("/accessToken").asText();
    }

    private record ProvisionBody(String name, String ownerEmail) {}

    private record InviteBody(String email, String role) {}

    private record RegisterBody(String email, String name, String password) {}

    private record LoginBody(String email, String password) {}
}
