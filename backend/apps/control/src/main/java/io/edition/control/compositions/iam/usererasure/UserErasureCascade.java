package io.edition.control.compositions.iam.usererasure;

import io.edition.concepts.apitoken.api.ApiTokenApi;
import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.readersecurity.api.ReaderStateApi;
import io.edition.concepts.session.api.SessionApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.tenantregistry.api.TenantScopeApi;
import io.edition.concepts.user.api.UserApi;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** 用户停用与抹除的跨概念级联；加入入口事务，任一步失败回滚全部效果。 */
@Component
final class UserErasureCascade {
    private final UserApi users;
    private final io.edition.concepts.password.api.PasswordApi passwords;
    private final UserDirectory directory;
    private final SessionApi sessions;
    private final ApiTokenApi tokens;
    private final io.edition.concepts.managementtoken.api.ManagementTokenApi managementTokens;
    private final MembershipApi memberships;
    private final PermissionApi permissions;
    private final TenantScopeApi tenantScope;
    private final io.edition.concepts.audit.api.AuditApi audit;
    private final io.edition.concepts.mailoutbox.api.MailDeliveryApi mail;
    private final ReaderStateApi readerState;

    UserErasureCascade(
            UserApi users,
            io.edition.concepts.password.api.PasswordApi passwords,
            UserDirectory directory,
            SessionApi sessions,
            ApiTokenApi tokens,
            io.edition.concepts.managementtoken.api.ManagementTokenApi managementTokens,
            MembershipApi memberships,
            PermissionApi permissions,
            TenantScopeApi tenantScope,
            io.edition.concepts.audit.api.AuditApi audit,
            io.edition.concepts.mailoutbox.api.MailDeliveryApi mail,
            ReaderStateApi readerState) {
        this.users = users;
        this.passwords = passwords;
        this.directory = directory;
        this.sessions = sessions;
        this.tokens = tokens;
        this.managementTokens = managementTokens;
        this.memberships = memberships;
        this.permissions = permissions;
        this.tenantScope = tenantScope;
        this.audit = audit;
        this.mail = mail;
        this.readerState = readerState;
    }

    void deactivate(UserApi.UserId user) {
        switch (users.deactivate(user)) {
            case UserApi.LifecycleResult.NotFound ignored -> throw new UserErasureTypes.UserNotFoundException();
            case UserApi.LifecycleResult.Erased ignored -> throw new UserErasureTypes.UserErasedException();
            case UserApi.LifecycleResult.Ok ignored -> revokeInteractiveAndMachineCredentials(user);
        }
    }

    void reactivate(UserApi.UserId user) {
        switch (users.reactivate(user)) {
            case UserApi.LifecycleResult.NotFound ignored -> throw new UserErasureTypes.UserNotFoundException();
            case UserApi.LifecycleResult.Erased ignored -> throw new UserErasureTypes.UserErasedException();
            case UserApi.LifecycleResult.Ok ignored -> {}
        }
    }

    void eraseSelf(UserApi.UserId user) {
        switch (users.deactivate(user)) {
            case UserApi.LifecycleResult.NotFound ignored -> throw new UserErasureTypes.UserNotFoundException();
            case UserApi.LifecycleResult.Erased ignored -> throw new UserErasureTypes.UserErasedException();
            case UserApi.LifecycleResult.Ok ignored -> eraseLocked(user);
        }
    }

    void erasePlatform(UserApi.UserId user) {
        switch (users.deactivate(user)) {
            case UserApi.LifecycleResult.NotFound ignored -> throw new UserErasureTypes.UserNotFoundException();
            case UserApi.LifecycleResult.Erased ignored -> {
                return;
            }
            case UserApi.LifecycleResult.Ok state -> {
                if (state.changed()) throw new UserErasureTypes.UserMustBeDeactivatedException();
                eraseLocked(user);
            }
        }
    }

    private void eraseLocked(UserApi.UserId user) {
        UserApi.AccountProfile profile = directory.profile(user);
        Discovery discovery = tenantScope.withoutTenant(
                TenantScopeApi.BootstrapReason.USER_SECURITY_CASCADE,
                () -> new Discovery(
                        tokens.ownedBy(user.value(), true),
                        memberships.lockGroupsOf(new MembershipApi.MemberId(user.value())),
                        permissions.tenantIdsOf(userPrincipal(user))));

        List<UserErasureTypes.RelatedGroup> blockers = ownershipBlockers(discovery.memberships());
        if (!blockers.isEmpty()) throw new UserErasureTypes.OwnershipTransferRequiredException(blockers);

        var tenantIds = new HashSet<>(discovery.permissionTenants());
        discovery.tokens().forEach(token -> {
            tenantIds.add(token.tenantId());
            tenantScope.inTenant(new TenantRegistryApi.TenantId(token.tenantId()), () -> {
                tokens.revoke(token.id());
                tokens.anonymize(token.id());
                permissions.clearPrincipal(tokenPrincipal(token));
            });
        });

        tenantScope.withoutTenant(TenantScopeApi.BootstrapReason.USER_SECURITY_CASCADE, () -> {
            memberships.revokeInvitesFor(profile.email());
            return null;
        });

        discovery.memberships().forEach(membership -> {
            tenantIds.add(membership.group().tenantId());
            tenantScope.inTenant(
                    new TenantRegistryApi.TenantId(membership.group().tenantId()), () -> {
                        var result = memberships.remove(membership.group(), new MembershipApi.MemberId(user.value()));
                        if (result instanceof MembershipApi.RemoveResult.LastOwner) {
                            throw new UserErasureTypes.OwnershipTransferRequiredException(
                                    List.of(directory.relatedGroup(membership.group())));
                        }
                    });
        });

        tenantIds.stream()
                .sorted()
                .forEach(tenant -> tenantScope.inTenant(
                        new TenantRegistryApi.TenantId(tenant), () -> permissions.clearPrincipal(userPrincipal(user))));
        audit.scrub(user.value());
        mail.eraseRecipient(profile.email());
        sessions.eraseAll(new SessionApi.HolderId(user.value()));
        managementTokens.eraseAll(user.value());
        switch (users.erase(user)) {
            case UserApi.EraseResult.Ok ignored -> {}
            case UserApi.EraseResult.NotFound ignored -> throw new UserErasureTypes.UserNotFoundException();
            case UserApi.EraseResult.MustBeDeactivated ignored ->
                throw new IllegalStateException("locked user became active during erase");
        }
        passwords.terminate(new io.edition.concepts.password.api.PasswordApi.AccountId(user.value()));
        readerState.erase(user.value());
    }

    private void revokeInteractiveAndMachineCredentials(UserApi.UserId user) {
        managementTokens.revokeAll(user.value());
        sessions.endAll(new SessionApi.HolderId(user.value()));
        List<ApiTokenApi.Metadata> owned = tenantScope.withoutTenant(
                TenantScopeApi.BootstrapReason.USER_SECURITY_CASCADE, () -> tokens.ownedBy(user.value(), false));
        owned.forEach(token -> tenantScope.inTenant(new TenantRegistryApi.TenantId(token.tenantId()), () -> {
            tokens.revoke(token.id());
            permissions.clearPrincipal(tokenPrincipal(token));
        }));
    }

    private List<UserErasureTypes.RelatedGroup> ownershipBlockers(List<MembershipApi.Membership> membershipRows) {
        var blockers = new ArrayList<UserErasureTypes.RelatedGroup>();
        membershipRows.stream()
                .sorted(Comparator.comparing(
                                (MembershipApi.Membership row) -> row.group().tenantId())
                        .thenComparing(row -> row.group().type())
                        .thenComparing(row -> row.group().id()))
                .filter(row -> row.role() == MembershipApi.Role.OWNER)
                .forEach(row -> {
                    long owners = tenantScope.inTenant(
                            new TenantRegistryApi.TenantId(row.group().tenantId()),
                            () -> memberships.lockOwnerCount(row.group()));
                    if (owners <= 1) blockers.add(directory.relatedGroup(row.group()));
                });
        return blockers;
    }

    /** 幂等作用域与授权清理都以用户主体计。 */
    static PermissionApi.Principal userPrincipal(UserApi.UserId user) {
        return new PermissionApi.Principal(PermissionApi.PrincipalType.USER, user.value());
    }

    private static PermissionApi.Principal tokenPrincipal(ApiTokenApi.Metadata token) {
        return new PermissionApi.Principal(
                PermissionApi.PrincipalType.TOKEN, token.id().value());
    }

    private record Discovery(
            List<ApiTokenApi.Metadata> tokens,
            List<MembershipApi.Membership> memberships,
            java.util.Set<UUID> permissionTenants) {
        private Discovery {
            tokens = List.copyOf(tokens);
            memberships = List.copyOf(memberships);
            permissionTenants = java.util.Set.copyOf(permissionTenants);
        }
    }
}
