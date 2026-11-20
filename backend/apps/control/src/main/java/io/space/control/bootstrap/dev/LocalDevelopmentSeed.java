package io.space.control.bootstrap.dev;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.AddResult;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.membership.api.MembershipApi.Role;
import io.space.concepts.membership.api.MembershipApi.SetRoleResult;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.ProvisionResult;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.TenantId;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.View;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi.BootstrapReason;
import io.space.concepts.user.api.UserApi;
import io.space.concepts.user.api.UserApi.AccountProfile;
import io.space.concepts.user.api.UserApi.UserId;
import io.space.control.compositions.access.OwnerRootAccess;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 本机开发夹具：四个 {@code @dev.local} 账号和两个产品租户。
 * 不是 flow，不向 gateway 暴露，不进 SYNCS 门禁。只在 {@code spring.profiles.active=dev}
 * 时装载；每次启动把四人密码重置为 {@code password1} 并补回这两租户上的成员关系，
 * 其它租户与空间不动。
 */
@Component
@Profile("dev")
class LocalDevelopmentSeed implements ApplicationRunner {

    static final String EMAIL_SUFFIX = "@dev.local";
    static final String PASSWORD = "password1";
    static final String COMPUTE_TENANT = "云服务器";
    static final String STORAGE_TENANT = "对象存储";
    static final String OPERATOR_EMAIL = "operator@dev.local";
    static final String OWNER_EMAIL = "owner@dev.local";
    static final String MEMBER_EMAIL = "member@dev.local";
    static final String MULTI_EMAIL = "multi@dev.local";

    private static final Logger log = LoggerFactory.getLogger(LocalDevelopmentSeed.class);

    private static final List<Account> ACCOUNTS = List.of(
            new Account(OPERATOR_EMAIL, "运营员", true),
            new Account(OWNER_EMAIL, "计算所有者", false),
            new Account(MEMBER_EMAIL, "计算成员", false),
            new Account(MULTI_EMAIL, "跨产品", false));

    private final Environment environment;
    private final UserApi users;
    private final PasswordApi passwords;
    private final TenantRegistryApi tenants;
    private final TenantScopeApi tenantScope;
    private final MembershipApi memberships;
    private final OwnerRootAccess ownerRootAccess;
    private final JdbcTemplate jdbc;

    LocalDevelopmentSeed(
            Environment environment,
            UserApi users,
            PasswordApi passwords,
            TenantRegistryApi tenants,
            TenantScopeApi tenantScope,
            MembershipApi memberships,
            OwnerRootAccess ownerRootAccess,
            JdbcTemplate jdbc) {
        this.environment = environment;
        this.users = users;
        this.passwords = passwords;
        this.tenants = tenants;
        this.tenantScope = tenantScope;
        this.memberships = memberships;
        this.ownerRootAccess = ownerRootAccess;
        this.jdbc = jdbc;
        for (Account account : ACCOUNTS) {
            if (!account.email().endsWith(EMAIL_SUFFIX)) {
                throw new IllegalStateException("local seed emails must use " + EMAIL_SUFFIX);
            }
        }
    }

    @Override
    public void run(ApplicationArguments args) {
        ensure();
    }

    void ensure() {
        if (environment.acceptsProfiles(Profiles.of("prod", "production"))) {
            throw new IllegalStateException("local development seed refused when a production profile is active");
        }
        ensureAccount(ACCOUNTS.get(0));
        UserId owner = ensureAccount(ACCOUNTS.get(1));
        UserId member = ensureAccount(ACCOUNTS.get(2));
        UserId multi = ensureAccount(ACCOUNTS.get(3));

        TenantId compute = findOrProvision(COMPUTE_TENANT, owner);
        TenantId storage = findOrProvision(STORAGE_TENANT, multi);
        ensureMembership(compute, member, Role.MEMBER);
        ensureMembership(compute, multi, Role.MEMBER);

        log.atInfo()
                .addKeyValue("event", "local.development-seed")
                .addKeyValue("operator", OPERATOR_EMAIL)
                .addKeyValue("computeTenant", compute.value().toString())
                .addKeyValue("storageTenant", storage.value().toString())
                .log(
                        "local development fixtures ready ({}, {}, {}, {})",
                        OPERATOR_EMAIL,
                        OWNER_EMAIL,
                        MEMBER_EMAIL,
                        MULTI_EMAIL);
    }

    private UserId ensureAccount(Account account) {
        UserId user = users.byEmail(account.email()).orElseGet(() -> register(account));
        AccountProfile profile = users.accountProfile(user)
                .orElseThrow(() -> new IllegalStateException("seed account missing: " + account.email()));
        if (profile.status() == UserApi.Status.DEACTIVATED) {
            users.reactivate(user);
        }
        if (!profile.verified()) {
            var challenge = users.requestVerification(user)
                    .orElseThrow(() -> new IllegalStateException("seed verification challenge unavailable"));
            if (!(users.verify(user, challenge.token()) instanceof UserApi.VerifyResult.Verified)) {
                throw new IllegalStateException("seed verification rejected");
            }
        }
        if (account.platformOperator() && !users.isPlatformOperator(user)) {
            jdbc.update("update iam.users set platform_operator = true where id = ?", user.value());
        }
        if (passwords.set(new PasswordApi.AccountId(user.value()), PASSWORD)
                instanceof PasswordApi.SetResult.TooWeak weak) {
            throw new IllegalStateException("seed password rejected: " + weak.violations());
        }
        return user;
    }

    private UserId register(Account account) {
        return switch (users.register(account.email(), account.name())) {
            case UserApi.RegisterResult.Registered registered -> registered.user();
            case UserApi.RegisterResult.EmailTaken ignored ->
                users.byEmail(account.email())
                        .orElseThrow(() -> new IllegalStateException("email taken but not found: " + account.email()));
        };
    }

    private TenantId findOrProvision(String name, UserId owner) {
        List<View> named = allTenants().stream()
                .filter(tenant -> tenant.name().equals(name))
                .toList();
        View existing = named.stream()
                .filter(tenant -> isMember(tenant.id(), owner))
                .min(Comparator.comparing(View::createdAt))
                .or(() -> named.stream().min(Comparator.comparing(View::createdAt)))
                .orElse(null);
        if (existing != null) {
            ensureMembership(existing.id(), owner, Role.OWNER);
            return existing.id();
        }
        View tenant =
                tenantScope.withoutTenant(BootstrapReason.TENANT_PROVISIONING, () -> switch (tenants.provision(name)) {
                    case ProvisionResult.InvalidName invalid -> throw new IllegalStateException(invalid.reason());
                    case ProvisionResult.Provisioned ok -> ok.tenant();
                });
        ensureMembership(tenant.id(), owner, Role.OWNER);
        return tenant.id();
    }

    private boolean isMember(TenantId tenant, UserId user) {
        return tenantScope.inTenant(
                tenant, () -> memberships.isMember(Group.tenant(tenant.value()), new MemberId(user.value())));
    }

    private void ensureMembership(TenantId tenant, UserId user, Role role) {
        tenantScope.inTenant(tenant, () -> {
            Group group = Group.tenant(tenant.value());
            MemberId member = new MemberId(user.value());
            switch (memberships.add(group, member, role)) {
                case AddResult.Added ignored -> ownerRootAccess.grant(group, member, role);
                case AddResult.AlreadyMember ignored -> {
                    switch (memberships.setRole(group, member, role)) {
                        case SetRoleResult.RoleSet set -> {
                            if (set.role() == Role.OWNER) {
                                ownerRootAccess.grant(group, member, Role.OWNER);
                            } else {
                                ownerRootAccess.revoke(group, member);
                            }
                        }
                        case SetRoleResult.LastOwner ignoredLast ->
                            log.atWarn()
                                    .addKeyValue("event", "local.development-seed")
                                    .addKeyValue("tenant", tenant.value().toString())
                                    .addKeyValue(
                                            "email",
                                            users.accountProfile(user)
                                                    .map(AccountProfile::email)
                                                    .orElse(""))
                                    .log("seed membership left as last owner; cannot demote");
                        case SetRoleResult.NotMember ignoredMissing -> {
                            memberships.add(group, member, role);
                            ownerRootAccess.grant(group, member, role);
                        }
                    }
                }
            }
        });
    }

    private List<View> allTenants() {
        List<View> found = new ArrayList<>();
        String cursor = null;
        do {
            var page = tenants.list(cursor, 100);
            found.addAll(page.tenants());
            cursor = page.nextCursor();
        } while (cursor != null);
        return found;
    }

    private record Account(String email, String name, boolean platformOperator) {}
}
