package io.space.control.compositions.platform.maildelivery;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.mailoutbox.api.MailDeliveryApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.iam.accountsecurity.ForgotUseCase;
import io.space.control.compositions.iam.registration.RegisterUseCase;
import io.space.control.compositions.iam.registration.ResendVerificationUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import io.space.control.support.SmtpReceiver;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(
        properties = {
            "io.space.mail-outbox.enabled=true",
            "io.space.mail-outbox.initial-delay-ms=600000",
            "spring.mail.properties.mail.smtp.starttls.enable=false",
            "spring.mail.properties.mail.smtp.starttls.required=false"
        })
@Testcontainers
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class MailDeliveryAcceptanceTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    static final SmtpReceiver smtp;

    static {
        try {
            smtp = new SmtpReceiver();
        } catch (java.io.IOException failure) {
            throw new java.io.UncheckedIOException(failure);
        }
    }

    @DynamicPropertySource
    static void smtpProperties(DynamicPropertyRegistry properties) {
        properties.add("spring.mail.host", () -> "127.0.0.1");
        properties.add("spring.mail.port", smtp::port);
    }

    @org.springframework.beans.factory.annotation.Autowired
    DeliverMailOnSchedule deliverMailOnSchedule;

    @Autowired
    MailEligibility eligibility;

    @Autowired
    io.space.concepts.mailoutbox.api.MailTransport transport;

    @Autowired
    io.micrometer.core.instrument.MeterRegistry metrics;

    @Autowired
    MailDeliveryApi delivery;

    @org.springframework.beans.factory.annotation.Autowired
    RegisterUseCase registerUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResendVerificationUseCase resendVerificationUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ForgotUseCase forgotUseCase;

    @Autowired
    UserApi users;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantRegistryApi tenants;

    @Autowired
    TenantScopeApi scope;

    @Autowired
    org.springframework.test.web.servlet.MockMvc mvc;

    @Autowired
    io.space.concepts.session.api.SessionApi sessions;

    @Autowired
    io.space.concepts.mailoutbox.api.MailOutboxApi outbox;

    @Autowired
    io.space.concepts.permission.api.PermissionApi permissions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @BeforeEach
    void clean() {
        jdbc.update("delete from shared.mail_outbox");
        smtp.clear();
    }

    @AfterAll
    static void close() throws java.io.IOException {
        smtp.close();
    }

    @Test
    void threeKindsRecoverAfterSmtpFailureAndDoNotReissueCredentials() {
        String email = "three-" + UUID.randomUUID() + "@mail.invalid";
        UUID user = registerUseCase.register(email, "Recipient", "password1");
        smtp.rejectNext();
        deliverMailOnSchedule.deliverMail();
        var verification = delivery.list(null, null, 10).getFirst();
        assertThat(verification.status()).isEqualTo("retrying");
        due(verification.id());
        deliverMailOnSchedule.deliverMail();
        assertThat(delivery.view(verification.id()).orElseThrow().outcome()).isEqualTo("accepted");
        assertThat(smtp.messages()).hasSize(1);
        jdbc.update("update iam.users set verified=true where id=?", user);
        forgotUseCase.forgot(email);
        smtp.rejectNext();
        deliverMailOnSchedule.deliverMail();
        var reset = delivery.list(null, null, 10).stream()
                .filter(v -> v.kind().equals("password_reset"))
                .findFirst()
                .orElseThrow();
        assertThat(reset.status()).isEqualTo("retrying");
        due(reset.id());
        deliverMailOnSchedule.deliverMail();
        var tenant = ((TenantRegistryApi.ProvisionResult.Provisioned) tenants.provision("Mail tenant"))
                .tenant()
                .id();
        scope.inTenant(
                tenant,
                () -> memberships.invite(
                        MembershipApi.Group.tenant(tenant.value()), "invite@mail.invalid", MembershipApi.Role.MEMBER));
        smtp.rejectNext();
        deliverMailOnSchedule.deliverMail();
        var invite = delivery.list(null, null, 10).stream()
                .filter(v -> v.kind().equals("invitation"))
                .findFirst()
                .orElseThrow();
        assertThat(invite.status()).isEqualTo("retrying");
        due(invite.id());
        deliverMailOnSchedule.deliverMail();
        assertThat(smtp.messages()).hasSize(3);
        assertThat(delivery.list(null, null, 10))
                .allSatisfy(v -> assertThat(v.outcome()).isEqualTo("accepted"));
        assertThat(delivery.list(tenant.value(), null, 10)).hasSize(1);
    }

    @Test
    void lostAcknowledgementMayRepeatMailButPreservesMessageAndChallenge() throws Exception {
        registerUseCase.register("ack-" + UUID.randomUUID() + "@mail.invalid", "Recipient", "password1");
        smtp.loseNextAcknowledgement();
        deliverMailOnSchedule.deliverMail();
        var job = delivery.list(null, null, 10).getFirst();
        assertThat(job.status()).isEqualTo("retrying");
        due(job.id());
        var changedTemplates = new MailTemplates(
                "https://changed.invalid/verify?user=%s&token=%s",
                "https://changed.invalid/invite/%s", "https://changed.invalid/reset/%s");
        new DeliverMailOnSchedule(
                        new MailDeliveryDependencies(delivery, eligibility, transport, changedTemplates, metrics))
                .deliverMail();
        assertThat(smtp.messages()).hasSize(2);
        var session = jakarta.mail.Session.getInstance(new Properties());
        var first = new jakarta.mail.internet.MimeMessage(
                session,
                new java.io.ByteArrayInputStream(
                        smtp.messages().get(0).getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        var second = new jakarta.mail.internet.MimeMessage(
                session,
                new java.io.ByteArrayInputStream(
                        smtp.messages().get(1).getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        assertThat(first.getHeader("X-Space-Event-Id")).containsExactly(job.id().toString());
        assertThat(second.getHeader("X-Space-Event-Id"))
                .containsExactly(job.id().toString());
        assertThat(second.getContent()).isEqualTo(first.getContent());
        assertThat(delivery.view(job.id()).orElseThrow().status()).isEqualTo("completed");
    }

    @Test
    void replacementAndExpiryDoNotSendObsoleteVerification() {
        String email = "obsolete-" + UUID.randomUUID() + "@mail.invalid";
        UUID user = registerUseCase.register(email, "Recipient", "password1");
        resendVerificationUseCase.resendVerification(email);
        deliverMailOnSchedule.deliverMail();
        assertThat(delivery.list(null, null, 10).stream().filter(v -> "obsolete".equals(v.outcome())))
                .hasSize(1);
        jdbc.update("update iam.users set verify_expires_at=now()-interval '1 second' where id=?", user);
        deliverMailOnSchedule.deliverMail();
        assertThat(smtp.messages()).isEmpty();
        assertThat(delivery.list(null, null, 10))
                .allSatisfy(v -> assertThat(v.outcome()).isEqualTo("obsolete"));
        resendVerificationUseCase.resendVerification(email);
        deliverMailOnSchedule.deliverMail();
        assertThat(smtp.messages()).hasSize(1);
    }

    @Test
    void activeUnverifiedAccountCanStillReceiveItsRequestedPasswordReset() {
        String email = "unverified-" + UUID.randomUUID() + "@mail.invalid";
        UUID user = registerUseCase.register(email, "Recipient", "password1");
        assertThat(users.profile(new UserApi.UserId(user)).orElseThrow().verified())
                .isFalse();
        forgotUseCase.forgot(email);
        deliverMailOnSchedule.deliverMail();
        deliverMailOnSchedule.deliverMail();
        assertThat(delivery.list(null, null, 10).stream().filter(v -> v.kind().equals("password_reset")))
                .singleElement()
                .satisfies(v -> assertThat(v.outcome()).isEqualTo("accepted"));
        assertThat(smtp.messages()).hasSize(2);
    }

    private void due(UUID id) {
        jdbc.update("update shared.mail_outbox set next_run_at=now()-interval '1 second' where id=?", id);
    }

    @Test
    void resendIsUniformAndRateLimitedWithoutDisclosingEligibility() throws Exception {
        String email = "resend-" + UUID.randomUUID() + "@mail.invalid";
        registerUseCase.register(email, "Recipient", "password1");
        for (String address : List.of(email, "unknown-" + UUID.randomUUID() + "@mail.invalid")) {
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/auth/email:resend")
                            .contentType("application/json")
                            .content("{\"email\":\"" + address + "\"}"))
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                            .isAccepted());
        }
        assertThat(delivery.list(null, null, 10)).hasSize(2);
        for (int i = 0; i < 2; i++)
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/auth/email:resend")
                            .contentType("application/json")
                            .content("{\"email\":\"" + email + "\"}"))
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                            .isAccepted());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/auth/email:resend")
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\"}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                        .isTooManyRequests());
    }

    @Test
    void mailOperationsEnforcePlatformAndTenantScopesAndReplayOnce() throws Exception {
        var operator = ((UserApi.RegisterResult.Registered)
                        users.register("operator-" + UUID.randomUUID() + "@mail.invalid", "Operator"))
                .user();
        var owner = ((UserApi.RegisterResult.Registered)
                        users.register("owner-" + UUID.randomUUID() + "@mail.invalid", "Owner"))
                .user();
        jdbc.update("update iam.users set verified=true, platform_operator=true where id=?", operator.value());
        jdbc.update("update iam.users set verified=true where id=?", owner.value());
        var tenant = ((TenantRegistryApi.ProvisionResult.Provisioned) tenants.provision("Mail scope"))
                .tenant()
                .id();
        scope.inTenant(tenant, () -> {
            memberships.add(
                    MembershipApi.Group.tenant(tenant.value()),
                    new MembershipApi.MemberId(owner.value()),
                    MembershipApi.Role.OWNER);
            permissions.grant(
                    io.space.control.compositions.access.TenantAccess.tenant(tenant.value()),
                    new io.space.concepts.permission.api.PermissionApi.Principal(
                            io.space.concepts.permission.api.PermissionApi.PrincipalType.USER, owner.value()),
                    new io.space.concepts.permission.api.PermissionApi.Role("admin"));
        });
        String ownerAccess = access(owner), operatorAccess = access(operator);
        var invitation = outbox.enqueue(
                io.space.concepts.mailoutbox.api.MailOutboxApi.Kind.INVITATION,
                "recipient@mail.invalid",
                Map.of("token", "private-token", "tenantId", tenant.value().toString()));
        var lease = delivery.claim().orElseThrow();
        delivery.failed(lease, "mail_configuration", false);
        var reset = outbox.enqueue(
                io.space.concepts.mailoutbox.api.MailOutboxApi.Kind.PASSWORD_RESET,
                "private@mail.invalid",
                Map.of("token", "private-reset", "tenantId", tenant.value().toString()));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/ops/mail-jobs")
                        .header("Authorization", ownerAccess))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                        .isForbidden());
        String body = mvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/ops/mail-jobs")
                                .param("tenantId", tenant.value().toString())
                                .header("Authorization", ownerAccess))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                        .isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(body)
                .contains(invitation.value().toString())
                .doesNotContain(reset.value().toString(), "private-token", "recipient@mail.invalid");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                                "/ops/mail-jobs/" + reset.value() + ":retry")
                        .param("tenantId", tenant.value().toString())
                        .header("Authorization", ownerAccess)
                        .header("Idempotency-Key", UUID.randomUUID().toString()))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                        .isNotFound());
        String key = UUID.randomUUID().toString();
        String first = null;
        for (int i = 0; i < 2; i++) {
            String response = mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                                    "/ops/mail-jobs/" + invitation.value() + ":retry")
                            .header("Authorization", operatorAccess)
                            .header("Idempotency-Key", key))
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                            .isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();
            if (i == 0) first = response;
            else assertThat(response).isEqualTo(first);
        }
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.audit_log where action='Mail.retry' and target_id=?",
                        Integer.class,
                        invitation.value()))
                .isEqualTo(1);
    }

    private String access(UserApi.UserId user) {
        var started = (io.space.concepts.session.api.SessionApi.StartResult.Started) sessions.start(
                new io.space.concepts.session.api.SessionApi.HolderId(user.value()),
                new io.space.concepts.session.api.SessionApi.Device("test", "test", "test"),
                "unknown");
        return "Bearer " + started.credentials().accessToken();
    }
}
