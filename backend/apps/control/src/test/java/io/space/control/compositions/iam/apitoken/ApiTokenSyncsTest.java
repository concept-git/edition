package io.space.control.compositions.iam.apitoken;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;
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
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class ApiTokenSyncsTest {
    @org.springframework.beans.factory.annotation.Autowired
    ListTokensUseCase listTokensUseCase;

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    IssueTokenUseCase issueTokenUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RevokeTokenUseCase revokeTokenUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    PermissionApi permissions;

    @Autowired
    ApiTokenApi tokens;

    @Autowired
    MembershipApi memberships;

    @Autowired
    io.space.concepts.team.api.TeamApi teams;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void grantFailureRollsBackTokenAndIdempotencyRecord() {
        Fixture fixture = fixture();
        jdbc.execute("""
                create function iam.reject_token_grant() returns trigger language plpgsql as $$
                begin
                  if new.principal_type = 'token' then raise exception 'test rejection'; end if;
                  return new;
                end $$
                """);
        jdbc.execute("""
                create trigger reject_token_grant before insert or update on iam.permission_grants
                for each row execute function iam.reject_token_grant()
                """);
        String key = UUID.randomUUID().toString();
        try {
            assertThatThrownBy(() -> issue(fixture, fixture.ownerCredential(), key, "rollback", "reader"))
                    .isInstanceOf(RuntimeException.class);
        } finally {
            jdbc.execute("drop trigger reject_token_grant on iam.permission_grants");
            jdbc.execute("drop function iam.reject_token_grant()");
        }
        assertThat(jdbc.queryForObject(
                        "select count(*) from iam.api_tokens where tenant_id = ? and name = 'rollback'",
                        Long.class,
                        fixture.tenant()))
                .isZero();
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.idempotency_records where idempotency_key = ?", Long.class, key))
                .isZero();
    }

    @Test
    void listIsOwnerPlusAdministeredSpacesAndRevokeClearsGrant() {
        Fixture fixture = fixture();
        UserApi.UserId reader = tenantMember("reader-" + UUID.randomUUID() + "@token-sync.test", fixture);
        grant(fixture, reader.value(), "admin");
        String readerCredential = credential(reader);

        var ownerToken =
                issue(fixture, fixture.ownerCredential(), UUID.randomUUID().toString(), "owner-token", "reader");
        var readerToken = issue(fixture, readerCredential, UUID.randomUUID().toString(), "reader-token", "reader");
        grant(fixture, reader.value(), "reader");

        assertThat(listTokensUseCase
                        .listTokens(readerCredential, fixture.tenant(), null, 20)
                        .tokens())
                .extracting(ApiTokenTypes.TokenView::id)
                .containsExactly(readerToken.value().id());
        assertThat(listTokensUseCase
                        .listTokens(fixture.ownerCredential(), fixture.tenant(), null, 20)
                        .tokens())
                .extracting(ApiTokenTypes.TokenView::id)
                .contains(ownerToken.value().id(), readerToken.value().id());

        revokeTokenUseCase.revokeToken(
                readerCredential, fixture.tenant(), readerToken.value().id());
        assertThat(jdbc.queryForObject("""
                select count(*) from iam.permission_grants
                 where principal_type = 'token' and principal_id = ?
                """, Long.class, readerToken.value().id()))
                .isZero();
        assertThat(listTokensUseCase
                        .listTokens(readerCredential, fixture.tenant(), null, 20)
                        .tokens())
                .isEmpty();
    }

    @Test
    void roleEscalationAndInvalidExpiryAreDistinctRejections() {
        Fixture fixture = fixture();
        UserApi.UserId reader = tenantMember("limited-" + UUID.randomUUID() + "@token-sync.test", fixture);
        defineRole("limited-admin", "read", "admin");
        grant(fixture, reader.value(), "limited-admin");
        String credential = credential(reader);
        assertThatThrownBy(() -> issue(fixture, credential, UUID.randomUUID().toString(), "escalate", "author"))
                .isInstanceOf(ApiTokenTypes.RoleEscalationForbiddenException.class);
        assertThatThrownBy(() -> issueTokenUseCase.issueToken(
                        fixture.ownerCredential(),
                        UUID.randomUUID().toString(),
                        fixture.tenant(),
                        "expired",
                        fixture.space(),
                        "reader",
                        Set.of("read"),
                        Instant.now().minusSeconds(1)))
                .isInstanceOf(ApiTokenTypes.InvalidTokenExpiryException.class);
    }

    private FlowResponse<ApiTokenTypes.IssuedToken> issue(
            Fixture fixture, String credential, String key, String name, String role) {
        return issueTokenUseCase.issueToken(
                credential,
                key,
                fixture.tenant(),
                name,
                fixture.space(),
                role,
                Set.of("read"),
                Instant.now().plus(1, ChronoUnit.DAYS));
    }

    @Test
    void teamGrantedAdministrationProvidesTheSameTokenRoleCeiling() {
        var fixture = fixture();
        var member = tenantMember("team-admin-" + UUID.randomUUID() + "@token-sync.test", fixture);
        tenantScope.inTenant(new TenantRegistryApi.TenantId(fixture.tenant()), () -> {
            var team = ((io.space.concepts.team.api.TeamApi.CreateResult.Created)
                            teams.create(fixture.tenant(), "Token administrators"))
                    .team();
            memberships.add(
                    MembershipApi.Group.team(fixture.tenant(), team.id().value()),
                    new MembershipApi.MemberId(fixture.owner().value()),
                    MembershipApi.Role.OWNER);
            memberships.add(
                    MembershipApi.Group.team(fixture.tenant(), team.id().value()),
                    new MembershipApi.MemberId(member.value()),
                    MembershipApi.Role.MEMBER);
            permissions.grant(
                    new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, fixture.space()),
                    new PermissionApi.Principal(
                            PermissionApi.PrincipalType.TEAM, team.id().value()),
                    new PermissionApi.Role("admin"));
        });
        var issued = issue(fixture, credential(member), UUID.randomUUID().toString(), "From team admin", "reader");
        assertThat(issued.status()).isEqualTo(201);
        assertThat(issued.value().role()).isEqualTo("reader");
    }

    /** 租户作用域入口要求会话主体先是该租户成员（syncs/SYNCS.md「租户准入」），空间授权不能代替入租。 */
    private UserApi.UserId tenantMember(String email, Fixture fixture) {
        UserApi.UserId member = user(email);
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(fixture.tenant()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(fixture.tenant()),
                        new MembershipApi.MemberId(member.value()),
                        MembershipApi.Role.MEMBER));
        return member;
    }

    /** 种子角色由迁移拥有，运行时角色对 iam.permission_roles 只有 SELECT；自定义角色用 owner 池写入。 */
    private void defineRole(String role, String... operations) {
        jdbc.update(
                "insert into iam.permission_roles (role, operations) values (?, ?::text[])"
                        + " on conflict (role) do update set operations = excluded.operations",
                role,
                "{" + String.join(",", operations) + "}");
    }

    private void grant(Fixture fixture, UUID user, String role) {
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(fixture.tenant()),
                () -> permissions.grant(
                        new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, fixture.space()),
                        new PermissionApi.Principal(PermissionApi.PrincipalType.USER, user),
                        new PermissionApi.Role(role)));
    }

    private Fixture fixture() {
        UserApi.UserId operator = user("operator-" + UUID.randomUUID() + "@token-sync.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = user("owner-" + UUID.randomUUID() + "@token-sync.test");
        String ownerCredential = credential(owner);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), "Token Sync " + UUID.randomUUID(), email(owner))
                .tenant()
                .id();
        UUID space = createSpaceUseCase
                .createSpace(
                        ownerCredential,
                        tenant,
                        "Token Space",
                        "authored",
                        UUID.randomUUID().toString())
                .value()
                .id();
        return new Fixture(tenant, space, owner, ownerCredential);
    }

    private UserApi.UserId user(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Token User");
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        return registered.user();
    }

    private String credential(UserApi.UserId user) {
        return ((SessionApi.StartResult.Started) sessions.start(
                        new SessionApi.HolderId(user.value()),
                        new SessionApi.Device("Test", "Test", "Test"),
                        "unknown"))
                .credentials()
                .accessToken();
    }

    private String email(UserApi.UserId user) {
        return jdbc.queryForObject("select email::text from iam.users where id = ?", String.class, user.value());
    }

    private record Fixture(UUID tenant, UUID space, UserApi.UserId owner, String ownerCredential) {}
}
